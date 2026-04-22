import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useEffect, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import usePermissions from '@hooks/usePermissions';
import useReportTransactions from '@hooks/useReportTransactions';
import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {completeTestDriveTask} from '@libs/actions/Task';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import {getGPSCoordinates} from '@libs/GPSDraftDetailsUtils';
import {getExistingTransactionID, resolveOptimisticChatReportID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import dismissModalAndOpenReportInInboxTabHelper from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {findSelfDMReportID, generateReportID, getReportOrDraftReport, hasViolations as hasViolationsReportUtils, isMoneyRequestReport, isSelectedManagerMcTest} from '@libs/ReportUtils';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {
    getDefaultTaxCode,
    getRateID,
    getTaxValue,
    getValidWaypoints,
    isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
} from '@libs/TransactionUtils';
import type {GpsPoint} from '@userActions/IOU';
import {createDistanceRequest as createDistanceRequestIOUActions} from '@userActions/IOU';
import {submitPerDiemExpenseForSelfDM, submitPerDiemExpense as submitPerDiemExpenseIOUActions} from '@userActions/IOU/PerDiem';
import {getReceiverType, sendInvoice} from '@userActions/IOU/SendInvoice';
import {sendMoneyElsewhere, sendMoneyWithWallet} from '@userActions/IOU/SendMoney';
import {splitBill, splitBillAndOpenReport, startSplitBill} from '@userActions/IOU/Split';
import {requestMoney as requestMoneyIOUActions, trackExpense as trackExpenseIOUActions} from '@userActions/IOU/TrackExpense';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, PolicyCategories, RecentlyUsedCategories, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

// Ends the submit expense span, starts a geolocation child span, then calls getCurrentPosition.
// The expense callback receives GPS coordinates on success or undefined on error.
// Extracted to avoid duplicating this identical telemetry block across trackExpense and requestMoney paths.
function getCurrentPositionWithGeolocationSpan(onPosition: (gpsCoords?: {lat: number; long: number}) => void) {
    const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
    markSubmitExpenseEnd();

    startSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT, {
        name: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        op: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        parentSpan,
    });

    getCurrentPosition(
        (successData) => {
            onPosition({lat: successData.coords.latitude, long: successData.coords.longitude});
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
        (errorData) => {
            Log.info('[useExpenseSubmission] getCurrentPosition failed', false, errorData);
            onPosition();
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
    );
}

type UseExpenseSubmissionParams = {
    // Transaction data
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;

    // Report data
    report: OnyxEntry<Report>;
    reportID: string;

    // Policy data
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    isDraftPolicy: boolean;

    // User data
    currentUserPersonalDetails: {accountID: number; login?: string; email?: string};
    personalDetails: OnyxEntry<PersonalDetailsList>;
    participants: Participant[];

    // Request type flags
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    requestType: DeepValueOf<typeof CONST.IOU.REQUEST_TYPE> | undefined;
    isDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isCategorizingTrackExpense: boolean;
    isSharingTrackExpense: boolean;
    isUnreported: boolean;
    isPolicyExpenseChat: boolean;

    // Onyx values
    draftTransactionIDs: string[] | undefined;
    privateIsArchivedMap: Record<string, boolean | undefined>;

    // Navigation
    backToReport?: string;
};

function useExpenseSubmission(params: UseExpenseSubmissionParams) {
    const {
        transaction,
        transactions,
        receiptFiles,
        report,
        reportID,
        policy,
        policyCategories,
        isDraftPolicy,
        currentUserPersonalDetails,
        personalDetails,
        participants,
        iouType,
        action,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isMovingTransactionFromTrackExpense,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isUnreported,
        isPolicyExpenseChat,
        draftTransactionIDs,
        privateIsArchivedMap,
        backToReport,
    } = params;

    // Localization
    const {translate, toLocaleDigit} = useLocalize();

    // Permissions
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const shouldGenerateTransactionThreadReport = false;

    // UI state
    const [isConfirmed, setIsConfirmed] = useState(false);
    const formHasBeenSubmitted = useRef(false);

    // Transaction violations – ref keeps callbacks always reading the latest value without re-creating them.
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const transactionViolationsRef = useRef(transactionViolations);
    useEffect(() => {
        transactionViolationsRef.current = transactionViolations;
    }, [transactionViolations]);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');

    // Policy-scoped Onyx data
    const policyID = policy?.id;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    const [policyRecentlyUsedCurrenciesOnyx] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const policyRecentlyUsedCurrencies = policyRecentlyUsedCurrenciesOnyx ?? [];
    const [recentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${policyID}`);
    const lastWorkspaceNumber = useLastWorkspaceNumber();

    // Reports
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const reportTransactions = useReportTransactions(report?.reportID);

    // Invoice data
    const receiverParticipant = transaction?.participants?.find((p) => p?.accountID) ?? report?.invoiceReceiver;
    const receiverAccountID = receiverParticipant && 'accountID' in receiverParticipant && receiverParticipant.accountID ? receiverParticipant.accountID : CONST.DEFAULT_NUMBER_ID;
    const receiverType = getReceiverType(receiverParticipant);
    const senderWorkspaceID = transaction?.participants?.find((p) => p?.isSender)?.policyID;
    const [senderWorkspacePolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${senderWorkspaceID}`);
    const existingInvoiceReport = useParticipantsInvoiceReport(receiverAccountID, receiverType, senderWorkspaceID);

    // Policy tags from participants
    const participantsPolicyTags = useParticipantsPolicyTags(participants ?? []);

    // Global Onyx values
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});

    // Onboarding task data
    const {
        taskReport: viewTourTaskReport,
        taskParentReport: viewTourTaskParentReport,
        isOnboardingTaskParentReportArchived: isViewTourTaskParentReportArchived,
        hasOutstandingChildTask,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);
    const parentReportAction = useParentReportAction(viewTourTaskReport);

    // Derived values from transaction
    const isGPSDistanceRequest = isGPSDistanceRequestTransactionUtils(transaction);
    const customUnitRateID = getRateID(transaction) ?? '';
    const transactionDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (transaction?.comment?.customUnit?.quantity ?? undefined) : undefined;
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = isTaxTrackingEnabled(isPolicyExpenseChat || isUnreported, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest)
        ? ((transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '')
        : '';
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const transactionTaxValue = transaction?.taxValue ?? getTaxValue(policy, transaction, transactionTaxCode) ?? '';

    function requestMoney(selectedParticipantsArg: Participant[], shouldHandleNav: boolean, gpsPoint?: GpsPoint) {
        if (!transactions.length) {
            return;
        }

        const participant = selectedParticipantsArg.at(0);
        if (!participant) {
            return;
        }

        const optimisticChatReportID = generateReportID();
        const optimisticCreatedReportActionID = rand64();
        const optimisticReportPreviewActionID = rand64();
        let existingIOUReport: Report | undefined;

        for (const [index, item] of transactions.entries()) {
            const receipt = receiptFiles[item.transactionID];
            const isTestReceipt = receipt?.isTestReceipt ?? false;
            const isTestDriveReceipt = receipt?.isTestDriveReceipt ?? false;
            const isLinkedTrackedExpenseReportArchived =
                !!item.linkedTrackedExpenseReportID && privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];

            const itemAmount = isTestReceipt ? CONST.TEST_RECEIPT.AMOUNT : item.amount;
            const itemCurrency = isTestReceipt ? CONST.TEST_RECEIPT.CURRENCY : item.currency;

            if (isTestDriveReceipt) {
                completeTestDriveTask(
                    viewTourTaskReport,
                    viewTourTaskParentReport,
                    isViewTourTaskParentReportArchived,
                    currentUserPersonalDetails.accountID,
                    hasOutstandingChildTask,
                    parentReportAction,
                    delegateEmail,
                    false,
                );
            }

            const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
            const existingTransactionDraft = transactions.find((tx) => tx.transactionID === existingTransactionID);
            let merchantToUse = isTestReceipt ? CONST.TEST_RECEIPT.MERCHANT : item.merchant;
            if (!isTestReceipt && isManualDistanceRequestTransactionUtils(item)) {
                const distance = item.comment?.customUnit?.quantity;
                const unit = item.comment?.customUnit?.distanceUnit;
                const rate = item.comment?.customUnit?.defaultP2PRate;
                if (distance && unit && rate) {
                    // Convert distance to meters
                    const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distance, unit);
                    merchantToUse = DistanceRequestUtils.getDistanceMerchant(
                        true,
                        distanceInMeters,
                        unit,
                        rate,
                        item.currency ?? CONST.CURRENCY.USD,
                        translate,
                        toLocaleDigit,
                        getCurrencySymbol,
                    );
                }
            }

            const {iouReport} = requestMoneyIOUActions({
                report,
                existingIOUReport,
                optimisticChatReportID,
                optimisticCreatedReportActionID,
                optimisticReportPreviewActionID,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant,
                },
                policyParams: {
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    policyRecentlyUsedCategories,
                    policyRecentlyUsedTags,
                },
                gpsPoint,
                action,
                transactionParams: {
                    amount: itemAmount,
                    distance: isManualDistanceRequest && typeof item.comment?.customUnit?.quantity === 'number' ? roundToTwoDecimalPlaces(item.comment.customUnit.quantity) : undefined,
                    attendees: item.comment?.attendees,
                    currency: itemCurrency,
                    created: item.created,
                    merchant: merchantToUse,
                    comment: item?.comment?.comment?.trim() ?? '',
                    receipt,
                    category: item.category,
                    tag: item.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    billable: item.billable,
                    reimbursable: item.reimbursable,
                    actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                    waypoints: Object.keys(item.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true, isGPSDistanceRequest) : undefined,
                    customUnitRateID,
                    isTestDrive: item.receipt?.isTestDriveReceipt,
                    originalTransactionID: item.comment?.originalTransactionID,
                    source: item.comment?.source,
                    isLinkedTrackedExpenseReportArchived,
                    isFromGlobalCreate: item?.isFromFloatingActionButton ?? item?.isFromGlobalCreate,
                    ...(isTimeRequest ? {type: CONST.TRANSACTION.TYPE.TIME, count: item.comment?.units?.count, rate: item.comment?.units?.rate, unit: CONST.TIME_TRACKING.UNIT.HOUR} : {}),
                },
                shouldHandleNavigation: shouldHandleNav && index === transactions.length - 1,
                shouldGenerateTransactionThreadReport,
                backToReport,
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                transactionViolations: transactionViolationsRef.current,
                policyRecentlyUsedCurrencies,
                quickAction,
                existingTransactionDraft,
                draftTransactionIDs,
                isSelfTourViewed,
                betas,
                personalDetails,
            });
            existingIOUReport = iouReport;
        }
    }

    function submitPerDiemExpense(selectedParticipantsArg: Participant[], trimmedComment: string, shouldHandleNav: boolean, policyRecentlyUsedCategoriesParam?: RecentlyUsedCategories) {
        if (!transaction) {
            return;
        }

        const participant = selectedParticipantsArg.at(0);
        if (!participant || isEmptyObject(transaction.comment) || isEmptyObject(transaction.comment.customUnit)) {
            return;
        }
        if (iouType === CONST.IOU.TYPE.TRACK) {
            submitPerDiemExpenseForSelfDM({
                selfDMReport,
                policy,
                transactionParams: {
                    currency: transaction.currency,
                    created: transaction.created,
                    comment: trimmedComment,
                    category: transaction.category,
                    tag: transaction.tag,
                    customUnit: transaction.comment?.customUnit,
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    attendees: transaction.comment?.attendees,
                    isFromGlobalCreate: transaction.isFromFloatingActionButton ?? transaction.isFromGlobalCreate,
                },
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                quickAction,
                shouldHandleNavigation: shouldHandleNav,
            });
        } else {
            const isExpenseReport = isMoneyRequestReport(report);
            let existingChatReport = report;
            if (isExpenseReport) {
                existingChatReport = getReportOrDraftReport(report?.chatReportID);
            } else if (!report?.reportID && participant.isPolicyExpenseChat && participant.reportID) {
                existingChatReport = getReportOrDraftReport(participant.reportID);
            }
            const {optimisticChatReportID, chatReportID} = resolveOptimisticChatReportID(
                [participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID],
                existingChatReport,
            );
            const activeReportID = isExpenseReport && Navigation.getTopmostReportId() === report?.reportID ? report?.reportID : chatReportID;

            const result = submitPerDiemExpenseIOUActions({
                report,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant,
                },
                policyParams: {
                    policy,
                    policyTagList: policyTags,
                    policyRecentlyUsedTags,
                    policyCategories,
                    policyRecentlyUsedCategories: policyRecentlyUsedCategoriesParam,
                },
                recentlyUsedParams: {
                    destinations: recentlyUsedDestinations,
                },
                transactionParams: {
                    currency: transaction.currency,
                    created: transaction.created,
                    comment: trimmedComment,
                    category: transaction.category,
                    tag: transaction.tag,
                    customUnit: transaction.comment?.customUnit,
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    attendees: transaction.comment?.attendees,
                    isFromGlobalCreate: transaction.isFromFloatingActionButton ?? transaction.isFromGlobalCreate,
                },
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                hasViolations,
                policyRecentlyUsedCurrencies,
                quickAction,
                betas,
                personalDetails,
                optimisticChatReportID,
                shouldHandleNavigation: shouldHandleNav,
            });
            if (shouldHandleNav && result && activeReportID) {
                navigateAfterExpenseCreate({
                    activeReportID,
                    transactionID: transaction.transactionID,
                    isFromGlobalCreate: transaction.isFromFloatingActionButton ?? transaction.isFromGlobalCreate,
                    hasMultipleTransactions: reportTransactions.length > 0,
                });
            }
        }
    }

    function trackExpense(selectedParticipantsArg: Participant[], shouldHandleNav: boolean, gpsPoint?: GpsPoint) {
        if (!transactions.length) {
            return;
        }
        const participant = selectedParticipantsArg.at(0);
        if (!participant) {
            return;
        }
        for (const [index, item] of transactions.entries()) {
            const isLinkedTrackedExpenseReportArchived =
                !!item.linkedTrackedExpenseReportID && privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];
            const itemDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (item.comment?.customUnit?.quantity ?? undefined) : undefined;

            const email = currentUserPersonalDetails.email ?? '';
            trackExpenseIOUActions({
                report,
                isDraftPolicy,
                action,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant,
                },
                policyParams: {
                    policy,
                    policyCategories,
                    policyTagList: policyTags,
                },
                transactionParams: {
                    amount: item.amount,
                    distance: itemDistance,
                    currency: item.currency,
                    created: item.created,
                    merchant: item.merchant,
                    comment: item?.comment?.comment?.trim() ?? '',
                    receipt: receiptFiles[item.transactionID],
                    category: item.category,
                    tag: item.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    billable: item.billable,
                    reimbursable: item.reimbursable,
                    gpsPoint,
                    validWaypoints: Object.keys(item?.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true, isGPSDistanceRequest) : undefined,
                    actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                    customUnitRateID,
                    attendees: item.comment?.attendees,
                    isLinkedTrackedExpenseReportArchived,
                    odometerStart: isOdometerDistanceRequest ? item.comment?.odometerStart : undefined,
                    odometerEnd: isOdometerDistanceRequest ? item.comment?.odometerEnd : undefined,
                    isFromGlobalCreate: item?.isFromFloatingActionButton ?? item?.isFromGlobalCreate,
                    gpsCoordinates: isGPSDistanceRequest ? getGPSCoordinates(gpsDraftDetails) : undefined,
                },
                accountantParams: {
                    accountant: item.accountant,
                },
                shouldHandleNavigation: shouldHandleNav && index === transactions.length - 1,
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: email,
                introSelected,
                activePolicyID,
                quickAction,
                recentWaypoints,
                betas,
                draftTransactionIDs,
                isSelfTourViewed,
                defaultWorkspaceName: generateDefaultWorkspaceName(email, lastWorkspaceNumber, translate),
            });
        }
    }

    function createDistanceRequest(selectedParticipantsArg: Participant[], trimmedComment: string, shouldHandleNav = true) {
        if (!transaction) {
            return;
        }

        createDistanceRequestIOUActions({
            report,
            participants: selectedParticipantsArg,
            currentUserLogin: currentUserPersonalDetails.login,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            iouType,
            existingTransaction: transaction,
            policyParams: {
                policy,
                policyCategories,
                policyTagList: policyTags,
                policyRecentlyUsedCategories,
                policyRecentlyUsedTags,
            },
            transactionParams: {
                amount: transaction.amount,
                comment: trimmedComment,
                distance: transactionDistance,
                created: transaction.created,
                currency: transaction.currency,
                merchant: transaction.merchant,
                category: transaction.category,
                tag: transaction.tag,
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
                taxValue: transactionTaxValue,
                customUnitRateID,
                splitShares: transaction.splitShares,
                validWaypoints: getValidWaypoints(transaction.comment?.waypoints, true, isGPSDistanceRequest),
                billable: transaction.billable,
                reimbursable: transaction.reimbursable,
                attendees: transaction.comment?.attendees,
                receipt: isManualDistanceRequest || isOdometerDistanceRequest ? receiptFiles[transaction.transactionID] : undefined,
                odometerStart: isOdometerDistanceRequest ? transaction.comment?.odometerStart : undefined,
                odometerEnd: isOdometerDistanceRequest ? transaction.comment?.odometerEnd : undefined,
                isFromGlobalCreate: transaction.isFromFloatingActionButton ?? transaction.isFromGlobalCreate,
                gpsCoordinates: isGPSDistanceRequest ? getGPSCoordinates(gpsDraftDetails) : undefined,
            },
            backToReport,
            isASAPSubmitBetaEnabled,
            transactionViolations: transactionViolationsRef.current,
            quickAction,
            policyRecentlyUsedCurrencies,
            personalDetails,
            recentWaypoints,
            betas,
            shouldHandleNavigation: shouldHandleNav,
        });
    }

    // shouldHandleNavigation is a function parameter, not a closure variable, so it does not
    // need to appear in any dependency array. The handle* functions pass it at call time
    // (e.g. createTransaction(participants, false, false) for fast paths).
    function createTransaction(selectedParticipantsArg: Participant[], locationPermissionGranted = false, shouldHandleNavigation = true) {
        setIsConfirmed(true);
        let splitParticipants = selectedParticipantsArg;

        // Filter out participants with an amount equal to O
        if (iouType === CONST.IOU.TYPE.SPLIT && transaction?.splitShares) {
            const participantsWithAmount = new Set(
                Object.keys(transaction.splitShares ?? {})
                    .filter((accountID: string): boolean => (transaction?.splitShares?.[Number(accountID)]?.amount ?? 0) > 0)
                    .map((accountID) => Number(accountID)),
            );
            splitParticipants = selectedParticipantsArg.filter((participant) =>
                participantsWithAmount.has(participant.isPolicyExpenseChat ? (participant?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) : (participant.accountID ?? CONST.DEFAULT_NUMBER_ID)),
            );
        }
        const trimmedComment = transaction?.comment?.comment?.trim() ?? '';

        // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
        if (formHasBeenSubmitted.current) {
            return;
        }

        formHasBeenSubmitted.current = true;

        // Telemetry spans (SPAN_SUBMIT_EXPENSE, SPAN_SUBMIT_TO_DESTINATION_VISIBLE)
        // are started by SubmitExpenseOrchestrator before calling createTransaction.
        if (iouType !== CONST.IOU.TYPE.TRACK && isDistanceRequest && !isMovingTransactionFromTrackExpense && !isUnreported) {
            createDistanceRequest(iouType === CONST.IOU.TYPE.SPLIT ? splitParticipants : selectedParticipantsArg, trimmedComment, shouldHandleNavigation);
            markSubmitExpenseEnd();
            return;
        }

        const currentTransactionReceiptFile = transaction?.transactionID ? receiptFiles[transaction.transactionID] : undefined;

        // Split (startSplitBill, splitBill, splitBillAndOpenReport) flows handle their own
        // navigation internally and don't participate in the dismiss-modal fast path.
        // shouldHandleNavigation is not threaded through to them.
        if (iouType === CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).filter((receipt) => !!receipt).length) {
            const currentUserLogin = currentUserPersonalDetails.login;
            if (currentUserLogin) {
                for (const [index, item] of transactions.entries()) {
                    const transactionReceiptFile = receiptFiles[item.transactionID];
                    if (!transactionReceiptFile) {
                        continue;
                    }
                    const itemTrimmedComment = item?.comment?.comment?.trim() ?? '';

                    // If we have a receipt let's start the split expense by creating only the action, the transaction, and the group DM if needed
                    startSplitBill({
                        participants: selectedParticipantsArg,
                        currentUserLogin,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        comment: itemTrimmedComment,
                        receipt: transactionReceiptFile,
                        existingSplitChatReportID: report?.reportID,
                        billable: item.billable,
                        reimbursable: item.reimbursable,
                        category: item.category,
                        tag: item.tag,
                        currency: item.currency,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        shouldPlaySound: index === transactions.length - 1,
                        policyRecentlyUsedCategories,
                        policyRecentlyUsedTags,
                        quickAction,
                        policyRecentlyUsedCurrencies,
                        participantsPolicyTags,
                    });
                }
            }
            markSubmitExpenseEnd();
            return;
        }

        // IOUs created from a group report will have a reportID param in the route.
        // Since the user is already viewing the report, we don't need to navigate them to the report
        if (iouType === CONST.IOU.TYPE.SPLIT && !transaction?.isFromGlobalCreate) {
            if (currentUserPersonalDetails.login && !!transaction) {
                splitBill({
                    participants: splitParticipants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    amount: transaction.amount,
                    comment: trimmedComment,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    created: transaction.created,
                    category: transaction.category,
                    tag: transaction.tag,
                    existingSplitChatReportID: report?.reportID,
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    iouRequestType: transaction.iouRequestType,
                    splitShares: transaction.splitShares,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    policyRecentlyUsedCategories,
                    policyRecentlyUsedTags,
                    isASAPSubmitBetaEnabled,
                    transactionViolations: transactionViolationsRef.current,
                    quickAction,
                    policyRecentlyUsedCurrencies,
                    betas,
                    personalDetails,
                });
            }
            markSubmitExpenseEnd();
            return;
        }

        // If the split expense is created from the global create menu, we also navigate the user to the group report
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            if (currentUserPersonalDetails.login && !!transaction) {
                splitBillAndOpenReport({
                    participants: splitParticipants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    amount: transaction.amount,
                    comment: trimmedComment,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    created: transaction.created,
                    category: transaction.category,
                    tag: transaction.tag,
                    billable: !!transaction.billable,
                    reimbursable: !!transaction.reimbursable,
                    iouRequestType: transaction.iouRequestType,
                    splitShares: transaction.splitShares,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    policyRecentlyUsedCategories,
                    policyRecentlyUsedTags,
                    isASAPSubmitBetaEnabled,
                    transactionViolations: transactionViolationsRef.current,
                    quickAction,
                    policyRecentlyUsedCurrencies,
                    betas,
                    personalDetails,
                });
            }
            markSubmitExpenseEnd();
            return;
        }

        if (iouType === CONST.IOU.TYPE.INVOICE) {
            const invoiceChatReport = !isEmptyObject(report) && report?.reportID ? report : existingInvoiceReport;
            const invoiceChatReportID = invoiceChatReport ? undefined : reportID;

            sendInvoice({
                currentUserAccountID: currentUserPersonalDetails.accountID,
                transaction,
                policyRecentlyUsedCurrencies,
                invoiceChatReport,
                invoiceChatReportID,
                receiptFile: currentTransactionReceiptFile,
                policy,
                policyTagList: policyTags,
                policyCategories,
                policyRecentlyUsedCategories,
                isFromGlobalCreate: transaction?.isFromFloatingActionButton ?? transaction?.isFromGlobalCreate,
                policyRecentlyUsedTags,
                senderPolicyTags: senderWorkspacePolicyTags ?? {},
                shouldHandleNavigation,
            });
            markSubmitExpenseEnd();
            return;
        }

        if (!isPerDiemRequest && (iouType === CONST.IOU.TYPE.TRACK || isCategorizingTrackExpense || isSharingTrackExpense)) {
            if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && transaction) {
                // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                    if (userLocation) {
                        trackExpense(selectedParticipantsArg, shouldHandleNavigation, {
                            lat: userLocation.latitude,
                            long: userLocation.longitude,
                        });
                        markSubmitExpenseEnd();
                        return;
                    }

                    getCurrentPositionWithGeolocationSpan((gpsCoords) => trackExpense(selectedParticipantsArg, shouldHandleNavigation, gpsCoords));
                    return;
                }

                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                trackExpense(selectedParticipantsArg, shouldHandleNavigation);
                markSubmitExpenseEnd();
                return;
            }
            trackExpense(selectedParticipantsArg, shouldHandleNavigation);
            markSubmitExpenseEnd();
            return;
        }

        if (isPerDiemRequest) {
            submitPerDiemExpense(selectedParticipantsArg, trimmedComment, shouldHandleNavigation, policyRecentlyUsedCategories);
            markSubmitExpenseEnd();
            return;
        }

        if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && !!transaction) {
            // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
            if (
                transaction.amount === 0 &&
                !isSharingTrackExpense &&
                !isCategorizingTrackExpense &&
                locationPermissionGranted &&
                !selectedParticipantsArg.some((participant) => isSelectedManagerMcTest(participant.login))
            ) {
                if (userLocation) {
                    requestMoney(selectedParticipantsArg, shouldHandleNavigation, {
                        lat: userLocation.latitude,
                        long: userLocation.longitude,
                    });
                    markSubmitExpenseEnd();
                    return;
                }

                getCurrentPositionWithGeolocationSpan((gpsCoords) => requestMoney(selectedParticipantsArg, shouldHandleNavigation, gpsCoords));
                return;
            }

            // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
            requestMoney(selectedParticipantsArg, shouldHandleNavigation);
            markSubmitExpenseEnd();
            return;
        }

        requestMoney(selectedParticipantsArg, shouldHandleNavigation);
        markSubmitExpenseEnd();
    }

    function sendMoney(paymentMethod: PaymentMethodType | undefined) {
        const currency = transaction?.currency;
        const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
        const participant = participants?.at(0);

        if (!participant || !transaction?.amount || !currency) {
            return;
        }

        const {optimisticChatReportID, chatReportID} = resolveOptimisticChatReportID([participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID], report);
        const sendMoneyParams = {
            report,
            quickAction,
            amount: transaction.amount,
            currency,
            comment: trimmedComment,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            recipient: participant,
            created: transaction.created,
            merchant: transaction.merchant,
            receipt: receiptFiles[transaction.transactionID],
            optimisticChatReportID,
        };

        if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            setIsConfirmed(true);
            sendMoneyElsewhere(sendMoneyParams);
        } else if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            setIsConfirmed(true);
            sendMoneyWithWallet(sendMoneyParams);
        } else {
            return;
        }
        dismissModalAndOpenReportInInboxTabHelper(chatReportID, undefined, reportTransactions.length > 0);
    }

    return {createTransaction, sendMoney, isConfirmed, formHasBeenSubmitted};
}

export default useExpenseSubmission;
export type {UseExpenseSubmissionParams};
