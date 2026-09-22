import useActivePolicy from '@hooks/useActivePolicy';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {WRITE_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getStringifiedGPSCoordinates} from '@libs/GPSDraftDetailsUtils';
import {rand64} from '@libs/NumberUtils';
import {getNewAccountIDsAndLogins} from '@libs/PersonalDetailsUtils';
import {generateReportID, getAllPolicyExpenseChatReportActions, getReportOrDraftReport, isMoneyRequestReport as isMoneyRequestReportReportUtils} from '@libs/ReportUtils';
import {getDistanceRequestType, getIsFromGlobalCreate, getRateID, getSelectedRouteDistance, getValidWaypoints} from '@libs/TransactionUtils';

import {trackExpense as trackExpenseIOUActions} from '@userActions/IOU/TrackExpense';
import type {GPSPoint as GpsPoint} from '@userActions/IOU/types/TrackExpenseTransactionParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelected, PersonalDetailsList, PolicyCategories, PolicyTagLists, QuickAction, Report, Rule} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isDraftReportSelector} from '@selectors/Report';

import type {CreateTransactionParams, SubmissionHandle} from './types';
import type {DistanceDraftData} from './useDistanceDraftData';
import type {SubmitWithGpsPoint} from './useGpsCapture';
import type {TransactionTaxValues} from './utils/getTransactionTaxValues';

import getCurrentReceiptState from './utils/getCurrentReceiptState';
import logSubmittedReceiptMilestone from './utils/logSubmittedReceiptMilestone';
import performPostBatchCleanup from './utils/performPostBatchCleanup';

type UseTrackExpenseSubmissionParams = TransactionTaxValues & {
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;
    canEnterScanFieldsManually: boolean;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    isDraftPolicy: boolean;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    selectedParticipants: Participant[];
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    isGPSDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isCategorizingTrackExpense: boolean;
    isSharingTrackExpense: boolean;
    isSubmittingExpenseToDraftWorkspace: boolean;
    isSelfDMDestination: boolean;
    isLookingAroundUser: boolean;
    draftTransactionIDs: string[] | undefined;
    privateIsArchivedMap: Record<string, boolean | undefined>;
    onExpenseWriteWillStart?: () => void;

    /** TEMP: hoisted in useExpenseSubmission so these Onyx keys open once across all mounted submission hooks.
     *  Read them here again once the page forks into per-path variants and only one hook mounts. */
    policyTags: OnyxEntry<PolicyTagLists>;
    rules: OnyxCollection<Rule>;
    quickAction: OnyxEntry<QuickAction>;
    introSelected: OnyxEntry<IntroSelected>;
    isSelfTourViewed: boolean;
    conciergeChat: OnyxEntry<Report>;
    selfDMReport: OnyxEntry<Report>;
    distanceDraftData: DistanceDraftData;
    submitWithGpsPoint: SubmitWithGpsPoint;
    delegateAccountID: number | undefined;
};

function useTrackExpenseSubmission({
    transaction,
    transactions,
    receiptFiles,
    canEnterScanFieldsManually,
    report,
    policy,
    policyCategories,
    isDraftPolicy,
    personalDetails,
    currentUserPersonalDetails,
    selectedParticipants,
    iouType,
    action,
    isGPSDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isCategorizingTrackExpense,
    isSharingTrackExpense,
    isSubmittingExpenseToDraftWorkspace,
    isSelfDMDestination,
    isLookingAroundUser,
    draftTransactionIDs,
    privateIsArchivedMap,
    transactionTaxCode,
    transactionTaxAmount,
    transactionTaxValue,
    onExpenseWriteWillStart,
    policyTags,
    rules,
    quickAction,
    introSelected,
    isSelfTourViewed,
    conciergeChat,
    selfDMReport,
    distanceDraftData,
    submitWithGpsPoint,
    delegateAccountID,
}: UseTrackExpenseSubmissionParams): SubmissionHandle {
    const {translate, formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const activePolicy = useActivePolicy();

    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;

    // A self-DM destination passes `undefined` as the chat to trackExpense, which then resolves the chat to the self-DM — a real report that is never a draft
    const destinationChatReportID = isSelfDMDestination ? undefined : currentChatReport?.reportID;
    const [isDraftChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${destinationChatReportID}`, {selector: isDraftReportSelector});

    const {gpsDraftDetails, recentWaypoints, odometerDraft, transactionDistance, isModifiedGPSDistanceRequest} = distanceDraftData;

    function trackExpense(shouldHandleNavigation: boolean, gpsPoint?: GpsPoint) {
        if (!transactions.length) {
            return;
        }

        const participant = selectedParticipants.at(0);
        if (!participant) {
            return;
        }

        // trackExpense bails per-item on malformed CATEGORIZE/SHARE/SUBMIT too late for UI cleanup — reject the batch upfront.
        const requiresLinkedTracked = action === CONST.IOU.ACTION.CATEGORIZE || action === CONST.IOU.ACTION.SHARE || action === CONST.IOU.ACTION.SUBMIT;
        if (requiresLinkedTracked && !transactions.every((item) => item.linkedTrackedExpenseReportAction && item.linkedTrackedExpenseReportID)) {
            return;
        }

        onExpenseWriteWillStart?.();

        const optimisticSelfDMReportID = selfDMReport?.reportID ?? generateReportID();

        // When the destination resolved to the current user/self-DM, force the self-DM as the chat (clearing any
        // non-self route report) so getTrackExpenseInformation defaults to the self-DM instead of the route report.
        const trackReport = isSelfDMDestination ? undefined : report;
        const policyExpenseChatReportActions = getAllPolicyExpenseChatReportActions(allReports, allReportActions);

        let submittedCommand: string = WRITE_COMMANDS.TRACK_EXPENSE;
        if (isCategorizingTrackExpense) {
            submittedCommand = WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE;
        } else if (isSharingTrackExpense) {
            submittedCommand = WRITE_COMMANDS.SHARE_TRACKED_EXPENSE;
        }

        let lastOptimisticTransactionID: string | undefined;
        for (const item of transactions) {
            const {newAccountIDs, newLogins} =
                item.accountant?.login && item.accountant.accountID ? getNewAccountIDsAndLogins({[item.accountant.login]: item.accountant.accountID}, personalDetails) : {};
            lastOptimisticTransactionID = rand64();

            const trackReceipt = receiptFiles[item.transactionID];
            logSubmittedReceiptMilestone({item, receipt: trackReceipt, optimisticTransactionID: lastOptimisticTransactionID, command: submittedCommand, iouType});

            const isLinkedTrackedExpenseReportArchived =
                !!item.linkedTrackedExpenseReportID && privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];
            const itemDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (item.comment?.customUnit?.quantity ?? undefined) : undefined;
            const itemDistanceUnit = item.comment?.customUnit?.distanceUnit;
            const originalItemDistance =
                isModifiedGPSDistanceRequest && gpsDraftDetails?.distanceInMeters && itemDistanceUnit
                    ? DistanceRequestUtils.convertDistanceUnit(gpsDraftDetails.distanceInMeters, itemDistanceUnit)
                    : itemDistance;
            const modifiedItemDistance = isModifiedGPSDistanceRequest ? transactionDistance : undefined;

            const email = currentUserPersonalDetails.email ?? '';

            trackExpenseIOUActions({
                getCurrencyDecimals,
                report: trackReport,
                isDraftPolicy,
                isDraftChatReport: !!isDraftChatReport,
                action,
                existingTransaction: item,
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
                    distance: originalItemDistance,
                    modifiedDistance: modifiedItemDistance,
                    currency: item.currency,
                    created: item.created,
                    merchant: item.merchant,
                    comment: item?.comment?.comment?.trim() ?? '',
                    receipt: trackReceipt,
                    receiptState: getCurrentReceiptState({item, receiptFiles, canEnterScanFieldsManually}),
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
                    customUnitRateID: getRateID(transaction) ?? '',
                    attendees: item.comment?.attendees,
                    isLinkedTrackedExpenseReportArchived,
                    odometerStart: isOdometerDistanceRequest ? item.comment?.odometerStart : undefined,
                    odometerEnd: isOdometerDistanceRequest ? item.comment?.odometerEnd : undefined,
                    isFromGlobalCreate: getIsFromGlobalCreate(item),
                    gpsCoordinates: isGPSDistanceRequest ? getStringifiedGPSCoordinates(gpsDraftDetails) : undefined,
                    distanceRequestType: getDistanceRequestType(transaction),
                    selectedRouteDistance: getSelectedRouteDistance(item),
                },
                accountantParams: {
                    accountant: item.accountant,
                    newLogins,
                    newAccountIDs,
                    formatPhoneNumber,
                },
                optimisticChatReportID: optimisticSelfDMReportID,
                optimisticTransactionID: lastOptimisticTransactionID,
                isASAPSubmitBetaEnabled,
                currentUser: {accountID: currentUserPersonalDetails.accountID, email},
                introSelected,
                activePolicy,
                conciergeChat,
                quickAction,
                recentWaypoints,
                betas,
                draftTransactionIDs,
                isSelfTourViewed,
                defaultWorkspaceName: generateDefaultWorkspaceName(email, currentUserPersonalDetails.displayName, lastWorkspaceNumber, translate),
                previousOdometerDraft: odometerDraft,
                reportActionsList: policyExpenseChatReportActions,
                currentUserLocalCurrency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                delegateAccountID,
                rules,
            });
        }
        performPostBatchCleanup({
            transactions,
            report,
            action,
            draftTransactionIDs,
            currentUserPersonalDetails,
            isLookingAroundUser,
            isSelfDMDestination,
            participant,
            shouldHandleNavigation,
            allTransactionsCreated: true,
            fallbackOptimisticChatReportID: optimisticSelfDMReportID,
            navigateBackToReport: undefined,
            lastOptimisticTransactionID,
            // trackExpense wrote to optimisticSelfDMReportID, so resolve the self-DM nav target directly. This
            // suppresses the route-report fallback in resolveChatTargetForSubmitCleanup, which would otherwise keep a
            // policy/group/source route report as the target when the self-DM report isn't loaded yet (fresh account
            // or before Onyx hydration) — leaving first-time self-DM creates navigating against the wrong report.
            preResolvedChatTarget: isSelfDMDestination ? {report: selfDMReport, chatReportID: optimisticSelfDMReportID} : undefined,
        });
    }

    function createTransaction({locationPermissionGranted = false, shouldHandleNavigation = true}: CreateTransactionParams) {
        const hasAnyReceiptFile = Object.values(receiptFiles).filter((receipt) => !!receipt).length > 0;

        // A zero amount means the expense came through the "Scan" flow, which needs GPS coordinates attached.
        const shouldCaptureGpsPoint =
            hasAnyReceiptFile &&
            !!transaction &&
            transaction.amount === 0 &&
            !isSharingTrackExpense &&
            !isCategorizingTrackExpense &&
            !isSubmittingExpenseToDraftWorkspace &&
            locationPermissionGranted;

        submitWithGpsPoint({shouldCaptureGpsPoint, shouldHandleNavigation, write: trackExpense});
    }

    return {createTransaction};
}

export default useTrackExpenseSubmission;
