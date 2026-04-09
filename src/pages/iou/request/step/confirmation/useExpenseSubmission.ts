import type {RefObject} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import useOnyx from '@hooks/useOnyx';
import {completeTestDriveTask} from '@libs/actions/Task';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import {getGPSCoordinates} from '@libs/GPSDraftDetailsUtils';
import {getExistingTransactionID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {generateReportID, isSelectedManagerMcTest} from '@libs/ReportUtils';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import getSubmitExpenseScenario from '@libs/telemetry/getSubmitExpenseScenario';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {getValidWaypoints, isManualDistanceRequest as isManualDistanceRequestTransactionUtils} from '@libs/TransactionUtils';
import type {GpsPoint} from '@userActions/IOU';
import {createDistanceRequest as createDistanceRequestIOUActions} from '@userActions/IOU';
import {submitPerDiemExpenseForSelfDM, submitPerDiemExpense as submitPerDiemExpenseIOUActions} from '@userActions/IOU/PerDiem';
import {sendInvoice} from '@userActions/IOU/SendInvoice';
import {sendMoneyElsewhere, sendMoneyWithWallet} from '@userActions/IOU/SendMoney';
import {splitBill, splitBillAndOpenReport, startSplitBill} from '@userActions/IOU/Split';
import {requestMoney as requestMoneyIOUActions, trackExpense as trackExpenseIOUActions} from '@userActions/IOU/TrackExpense';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    GpsDraftDetails,
    IntroSelected,
    PersonalDetailsList,
    PolicyCategories,
    PolicyTagLists,
    QuickAction,
    RecentlyUsedCategories,
    RecentlyUsedTags,
    Report,
    ReportAction,
    TransactionViolation,
} from '@src/types/onyx';
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
    transactionViolationsRef: RefObject<OnyxCollection<TransactionViolation[]>>;

    // Report data
    report: OnyxEntry<Report>;
    reportID: string;
    existingInvoiceReport: OnyxEntry<Report>;
    selfDMReport: OnyxEntry<Report>;

    // Policy data
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    policyTags: OnyxEntry<PolicyTagLists>;
    policyRecentlyUsedCategories: OnyxEntry<RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    policyRecentlyUsedCurrencies: string[];
    recentlyUsedDestinations: OnyxEntry<string[]>;
    participantsPolicyTags: Record<string, PolicyTagLists>;
    senderWorkspacePolicyTags: OnyxEntry<PolicyTagLists>;
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
    isGPSDistanceRequest: boolean;
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isCategorizingTrackExpense: boolean;
    isSharingTrackExpense: boolean;
    isUnreported: boolean;

    // Tax data
    transactionTaxCode: string;
    transactionTaxAmount: number;
    transactionTaxValue: string;

    // Other derived values
    customUnitRateID: string;
    transactionDistance: number | undefined;
    hasViolations: boolean;
    shouldGenerateTransactionThreadReport: boolean;

    // Onyx values
    gpsDraftDetails: OnyxEntry<GpsDraftDetails>;
    introSelected: OnyxEntry<IntroSelected>;
    activePolicyID: OnyxEntry<string>;
    quickAction: OnyxEntry<QuickAction>;
    betas: OnyxEntry<Beta[]>;
    isSelfTourViewed: boolean;
    userLocation: OnyxEntry<{latitude: number; longitude: number}>;
    draftTransactionIDs: string[] | undefined;
    privateIsArchivedMap: Record<string, boolean | undefined>;

    // Navigation
    backToReport?: string;
    isASAPSubmitBetaEnabled: boolean;

    // Onboarding task data
    viewTourTaskReport: OnyxEntry<Report>;
    viewTourTaskParentReport: OnyxEntry<Report>;
    isViewTourTaskParentReportArchived: boolean;
    hasOutstandingChildTask: boolean;
    parentReportAction: OnyxEntry<ReportAction>;

    // Localization
    translate: LocaleContextProps['translate'];
    toLocaleDigit: LocaleContextProps['toLocaleDigit'];

    // UI state setters
    setIsConfirmed: (value: boolean) => void;
    formHasBeenSubmitted: RefObject<boolean>;
};

function useExpenseSubmission(params: UseExpenseSubmissionParams) {
    const {
        transaction,
        transactions,
        receiptFiles,
        transactionViolationsRef,
        report,
        reportID,
        existingInvoiceReport,
        selfDMReport,
        policy,
        policyCategories,
        policyTags,
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
        policyRecentlyUsedCurrencies,
        recentlyUsedDestinations,
        participantsPolicyTags,
        senderWorkspacePolicyTags,
        isDraftPolicy,
        currentUserPersonalDetails,
        personalDetails,
        participants,
        iouType,
        action,
        requestType,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isGPSDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isMovingTransactionFromTrackExpense,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isUnreported,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        customUnitRateID,
        transactionDistance,
        hasViolations,
        shouldGenerateTransactionThreadReport,
        gpsDraftDetails,
        introSelected,
        activePolicyID,
        quickAction,
        betas,
        isSelfTourViewed,
        userLocation,
        draftTransactionIDs,
        privateIsArchivedMap,
        backToReport,
        isASAPSubmitBetaEnabled,
        viewTourTaskReport,
        viewTourTaskParentReport,
        isViewTourTaskParentReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
        translate,
        toLocaleDigit,
        setIsConfirmed,
        formHasBeenSubmitted,
    } = params;

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);

    function requestMoney(selectedParticipantsArg: Participant[], gpsPoint?: GpsPoint) {
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
                shouldHandleNavigation: index === transactions.length - 1,
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

    function submitPerDiemExpense(selectedParticipantsArg: Participant[], trimmedComment: string, policyRecentlyUsedCategoriesParam?: RecentlyUsedCategories) {
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
            });
        } else {
            submitPerDiemExpenseIOUActions({
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
            });
        }
    }

    function trackExpense(selectedParticipantsArg: Participant[], gpsPoint?: GpsPoint) {
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
                shouldHandleNavigation: index === transactions.length - 1,
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                introSelected,
                activePolicyID,
                quickAction,
                recentWaypoints,
                betas,
                draftTransactionIDs,
                isSelfTourViewed,
            });
        }
    }

    function createDistanceRequest(selectedParticipantsArg: Participant[], trimmedComment: string) {
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
        });
    }

    function createTransaction(selectedParticipantsArg: Participant[], locationPermissionGranted = false) {
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

        const hasReceiptFiles = Object.values(receiptFiles).some((receipt) => !!receipt);
        const isFromGlobalCreate = transaction?.isFromGlobalCreate ?? transaction?.isFromFloatingActionButton ?? false;

        const scenario = getSubmitExpenseScenario({
            iouType,
            isDistanceRequest,
            isMovingTransactionFromTrackExpense,
            isUnreported,
            isCategorizingTrackExpense,
            isSharingTrackExpense,
            isPerDiemRequest,
            isFromGlobalCreate,
            hasReceiptFiles,
        });

        const submitSpanAttributes = {
            [CONST.TELEMETRY.ATTRIBUTE_SCENARIO]: scenario,
            [CONST.TELEMETRY.ATTRIBUTE_HAS_RECEIPT]: hasReceiptFiles,
            [CONST.TELEMETRY.ATTRIBUTE_IS_FROM_GLOBAL_CREATE]: isFromGlobalCreate,
            [CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType,
            [CONST.TELEMETRY.ATTRIBUTE_IOU_REQUEST_TYPE]: requestType ?? 'unknown',
        };

        startSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE, {
            name: 'submit-expense',
            op: CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE,
            attributes: submitSpanAttributes,
        });

        startSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE, {
            name: 'submit-to-destination-visible',
            op: CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE,
            attributes: submitSpanAttributes,
        });

        // IMPORTANT: Every branch below must call markSubmitExpenseEnd() after dispatching the expense action.
        // The submit follow-up action span above is ended by the target screen (ReportScreen, Search, etc.) or by runAfterInteractions for dismiss_modal_only.
        // This ensures the telemetry span started above is always closed, including inside async getCurrentPosition callbacks.
        // If missed, the impact is benign (an orphaned Sentry span), but it pollutes telemetry data.
        if (iouType !== CONST.IOU.TYPE.TRACK && isDistanceRequest && !isMovingTransactionFromTrackExpense && !isUnreported) {
            createDistanceRequest(iouType === CONST.IOU.TYPE.SPLIT ? splitParticipants : selectedParticipantsArg, trimmedComment);
            markSubmitExpenseEnd();
            return;
        }

        const currentTransactionReceiptFile = transaction?.transactionID ? receiptFiles[transaction.transactionID] : undefined;

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
            });
            markSubmitExpenseEnd();
            return;
        }

        if (!isPerDiemRequest && (iouType === CONST.IOU.TYPE.TRACK || isCategorizingTrackExpense || isSharingTrackExpense)) {
            if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && transaction) {
                // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                    if (userLocation) {
                        trackExpense(selectedParticipantsArg, {
                            lat: userLocation.latitude,
                            long: userLocation.longitude,
                        });
                        markSubmitExpenseEnd();
                        return;
                    }

                    getCurrentPositionWithGeolocationSpan((gpsCoords) => trackExpense(selectedParticipantsArg, gpsCoords));
                    return;
                }

                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                trackExpense(selectedParticipantsArg);
                markSubmitExpenseEnd();
                return;
            }
            trackExpense(selectedParticipantsArg);
            markSubmitExpenseEnd();
            return;
        }

        if (isPerDiemRequest) {
            submitPerDiemExpense(selectedParticipantsArg, trimmedComment, policyRecentlyUsedCategories);
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
                    requestMoney(selectedParticipantsArg, {
                        lat: userLocation.latitude,
                        long: userLocation.longitude,
                    });
                    markSubmitExpenseEnd();
                    return;
                }

                getCurrentPositionWithGeolocationSpan((gpsCoords) => requestMoney(selectedParticipantsArg, gpsCoords));
                return;
            }

            // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
            requestMoney(selectedParticipantsArg);
            markSubmitExpenseEnd();
            return;
        }

        requestMoney(selectedParticipantsArg);
        markSubmitExpenseEnd();
    }

    function sendMoney(paymentMethod: PaymentMethodType | undefined) {
        const currency = transaction?.currency;
        const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
        const participant = participants?.at(0);

        if (!participant || !transaction?.amount || !currency) {
            return;
        }

        if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            setIsConfirmed(true);
            sendMoneyElsewhere(
                report,
                quickAction,
                transaction.amount,
                currency,
                trimmedComment,
                currentUserPersonalDetails.accountID,
                participant,
                transaction.created,
                transaction.merchant,
                receiptFiles[transaction.transactionID],
            );
            return;
        }

        if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            setIsConfirmed(true);
            sendMoneyWithWallet(
                report,
                quickAction,
                transaction.amount,
                currency,
                trimmedComment,
                currentUserPersonalDetails.accountID,
                participant,
                transaction.created,
                transaction.merchant,
                receiptFiles[transaction.transactionID],
            );
        }
    }

    return {createTransaction, sendMoney};
}

export default useExpenseSubmission;
export type {UseExpenseSubmissionParams};
