import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import {usePersonalDetails, usePolicyCategories} from '@components/OnyxListItemProvider';
import ParticipantPicker from '@components/ParticipantPicker';
import PrevNextButtons from '@components/PrevNextButtons';
import ScreenWrapper from '@components/ScreenWrapper';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultParticipants from '@hooks/useDefaultParticipants';
import useFetchRoute from '@hooks/useFetchRoute';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOdometerReceiptStitcher from '@hooks/useOdometerReceiptStitcher';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import useParticipantsPolicies from '@hooks/useParticipantsPolicies';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setMoneyRequestBillable, setMoneyRequestReimbursable} from '@libs/actions/IOU/MoneyRequest';
import {setTransactionReport} from '@libs/actions/Transaction';
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getIsWorkspacesOnlyForTransaction,
    isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils,
    isParticipantP2P,
    navigateToStartMoneyRequestStep,
    resolveOptimisticChatReportID,
    resolveReportForMoneyRequest,
    shouldShowReceiptEmptyState,
    shouldUseTransactionDraft,
} from '@libs/IOUUtils';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import {submitWithDismissFirst} from '@libs/Navigation/helpers/submitWithDismissFirst';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {findSelfDMReportID, generateReportID, getReportOrDraftReport, isMoneyRequestReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {cancelTracking, getPendingSubmitFollowUpAction, isTracking} from '@libs/telemetry/submitFollowUpAction';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {
    getRequestType,
    hasReceipt,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isScanRequest,
} from '@libs/TransactionUtils';

import {getIOURequestPolicyID, setCustomUnitRateID, setMoneyRequestCategory, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {removeDraftTransaction, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {startTransition, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import CategoryDefaultsSetter from './confirmation/CategoryDefaultsSetter';
import DraftWorkspaceOpener from './confirmation/DraftWorkspaceOpener';
import ExpenseDefaultsSetter from './confirmation/ExpenseDefaultsSetter';
import MoneyRequestInitializer from './confirmation/MoneyRequestInitializer';
import ReceiptFileValidator from './confirmation/ReceiptFileValidator';
import SubmitExpenseOrchestrator from './confirmation/SubmitExpenseOrchestrator';
import TelemetrySpanManager from './confirmation/TelemetrySpanManager';
import useExpenseSubmission from './confirmation/useExpenseSubmission';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepConfirmationIncomingRouteName = typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION | typeof SCREENS.MONEY_REQUEST.CREATE;

type StepConfirmationParams = MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION];

type IOURequestStepConfirmationProps = WithWritableReportOrNotFoundProps<IOURequestStepConfirmationIncomingRouteName> &
    WithFullTransactionOrNotFoundProps<IOURequestStepConfirmationIncomingRouteName> & {
        shouldHideHeader?: boolean;
    };

function IOURequestStepConfirmation({
    report: reportReal,
    reportDraft,
    route,
    transaction: initialTransaction,
    isLoadingTransaction,
    shouldHideHeader = false,
    navigation,
}: IOURequestStepConfirmationProps) {
    const params = route.params;
    const {iouType, reportID, transactionID: initialTransactionID, action, backToReport, backTo} = params;
    const participantsAutoAssignedFromRoute = route.name === SCREENS.MONEY_REQUEST.STEP_CONFIRMATION ? (params as StepConfirmationParams).participantsAutoAssigned : undefined;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const personalDetails = usePersonalDetails();
    const allPolicyCategories = usePolicyCategories();

    const [transactions] = useOptimisticDraftTransactions(initialTransaction);
    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${initialTransaction?.participants?.at(0)?.reportID}`);
    const hasMultipleTransactions = transactions.length > 1;

    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const transactionIDs = useMemo(() => transactions?.map((transaction) => transaction.transactionID), [transactions.length]);
    // We will use setCurrentTransactionID later to switch between transactions

    const [currentTransactionID, setCurrentTransactionID] = useState<string>(initialTransactionID);
    const currentTransactionIndex = useMemo(() => transactions.findIndex((transaction) => transaction.transactionID === currentTransactionID), [transactions, currentTransactionID]);
    const [existingTransaction, existingTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(currentTransactionID)}`);
    const [optimisticTransaction, optimisticTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(currentTransactionID)}`);
    const isLoadingCurrentTransaction = isLoadingOnyxValue(existingTransactionResult, optimisticTransactionResult);
    const transaction = useMemo(
        () => (!isLoadingCurrentTransaction ? (optimisticTransaction ?? existingTransaction) : undefined),
        [existingTransaction, optimisticTransaction, isLoadingCurrentTransaction],
    );
    const requestType = getRequestType(transaction);
    const isPerDiemRequest = requestType === CONST.IOU.REQUEST_TYPE.PER_DIEM;
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const realPolicyID = getIOURequestPolicyID(initialTransaction, reportReal ?? participantReport);
    const draftPolicyID = getIOURequestPolicyID(initialTransaction, reportDraft);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${draftPolicyID}`);
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${realPolicyID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ReplaceReceipt', 'SmartScan']);

    /*
     * We want to use a report from the transaction if it exists
     * Also if the report was submitted and delayed submission is on, then we should use an initial report
     * Additionally, if neither reportReal nor reportDraft exist, we fallback to the transactionReport
     * to ensure proper navigation after expense creation.
     */
    const transactionReport = useReportOrReportDraft(transaction?.reportID);
    const reportWithDraftFallback = useMemo(() => reportReal ?? reportDraft, [reportDraft, reportReal]);
    const shouldHideToSection = useMemo(() => isMoneyRequestReport(reportWithDraftFallback), [reportWithDraftFallback]);
    const report = useMemo(
        () =>
            resolveReportForMoneyRequest({
                transaction,
                transactionReport,
                routeReport: reportWithDraftFallback,
                policy: policyReal,
            }),
        [transaction, transactionReport, reportWithDraftFallback, policyReal],
    );
    const [reportDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT);

    const {policy} = usePolicyForTransaction({
        transaction: initialTransaction,
        reportPolicyID: realPolicyID ?? draftPolicyID,
        action,
        iouType,
        isPerDiemRequest,
    });
    const policyID = policy?.id;
    const isDraftPolicy = policy === policyDraft;

    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${draftPolicyID}`);

    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: validTransactionDraftIDsSelector,
    });

    const reportAttributesDerived = useReportAttributes();

    const policyCategories = useMemo(() => {
        if (isDraftPolicy && draftPolicyID) {
            return policyCategoriesDraft;
        }

        if (policyID) {
            return allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
        }

        return undefined;
    }, [isDraftPolicy, draftPolicyID, policyID, policyCategoriesDraft, allPolicyCategories]);

    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    // isConfirming, selectedParticipantList, and startLocationPermissionFlow state
    // moved to SubmitExpenseOrchestrator.

    const [receiptFiles, setReceiptFiles] = useState<Record<string, Receipt>>({});
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isManualRequest = transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL;
    const isOdometerDistanceRequest = isOdometerDistanceRequestTransactionUtils(transaction);
    const isTimeRequest = requestType === CONST.IOU.REQUEST_TYPE.TIME;
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const receiptFilename = transaction?.receipt?.filename;
    const receiptPath = transaction?.receipt?.source;
    const isEditingReceipt = hasReceipt(transaction);
    const isSharingTrackExpense = action === CONST.IOU.ACTION.SHARE;
    const isCategorizingTrackExpense = action === CONST.IOU.ACTION.CATEGORIZE;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);

    const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).length && isScanRequest(transaction);
    const headerTitle = useMemo(() => {
        if (isCategorizingTrackExpense) {
            return translate('iou.categorize');
        }
        if (isSharingTrackExpense) {
            return translate('iou.share');
        }
        if (iouType === CONST.IOU.TYPE.INVOICE) {
            return translate('workspace.invoices.sendInvoice');
        }
        return translate('iou.confirmDetails');
    }, [iouType, translate, isSharingTrackExpense, isCategorizingTrackExpense]);

    useEffect(() => {
        if (!transaction?.transactionID || !transactionReport || iouType !== CONST.IOU.TYPE.PAY) {
            return;
        }
        setMoneyRequestParticipantsFromReport(transaction.transactionID, transactionReport, currentUserPersonalDetails.accountID);
    }, [transactionReport, currentUserPersonalDetails.accountID, transaction?.transactionID, iouType]);

    const participantsPolicies = useParticipantsPolicies(transaction?.participants ?? []);

    const participants = useMemo(
        () =>
            transaction?.participants?.map((participant) => {
                if (participant.isSender && iouType === CONST.IOU.TYPE.INVOICE) {
                    return participant;
                }
                const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`];
                const participantReportDraft = reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${participant.reportID}`];
                const participantPolicy = participant.policyID ? participantsPolicies[participant.policyID] : policy;
                // Phone contacts always have an optimistic accountID but no reportID; getReportOption
                // is designed for report-backed participants and discards participant.text, so route
                // any participant without a reportID to getParticipantsOption instead.
                return participant.accountID || !participant.reportID
                    ? getParticipantsOption(participant, personalDetails, translate)
                    : getReportOption(participant, privateIsArchived, participantPolicy, personalDetails, conciergeReportID, reportAttributesDerived, participantReportDraft);
            }) ?? [],
        [transaction?.participants, iouType, personalDetails, reportAttributesDerived, privateIsArchivedMap, participantsPolicies, policy, conciergeReportID, reportDrafts, translate],
    );

    const sourceReportID = transaction?.reportID ?? reportID;
    const sourceReport = useMemo(() => (sourceReportID ? getReportOrDraftReport(sourceReportID) : undefined), [sourceReportID]);
    const resolvedDefaultParticipants = useDefaultParticipants({sourceReport, transaction, iouType});
    const defaultParticipants = useMemo(() => {
        // Don't override the participants the user has already selected, and bail when there is no source report.
        const hasSelectedParticipants = (transaction?.participants ?? []).some((participant) => participant?.selected);
        if (hasSelectedParticipants || !sourceReportID) {
            return [];
        }
        return resolvedDefaultParticipants;
    }, [transaction?.participants, sourceReportID, resolvedDefaultParticipants]);

    const shouldAutoOpenParticipantPicker = useMemo(() => {
        if (!transaction?.transactionID) {
            return false;
        }
        const transactionParticipants = transaction?.participants ?? [];
        const hasTransactionParticipants = transactionParticipants.length > 0;
        const hasDefaultParticipants = defaultParticipants.length > 0;
        return !hasTransactionParticipants && !hasDefaultParticipants && isNewManualExpenseFlowEnabled && isManualRequest;
    }, [transaction?.transactionID, transaction?.participants, defaultParticipants.length, isNewManualExpenseFlowEnabled, isManualRequest]);
    const activeTransactionID = transaction?.transactionID;
    const [manuallyOpenedParticipantPickerForTransactionID, setManuallyOpenedParticipantPickerForTransactionID] = useState<string | undefined>();
    const [dismissedAutoOpenParticipantPickerForTransactionID, setDismissedAutoOpenParticipantPickerForTransactionID] = useState<string | undefined>();
    const participantPickerIOUType = iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK ? CONST.IOU.TYPE.CREATE : iouType;
    const isParticipantPickerVisible =
        !!activeTransactionID &&
        (manuallyOpenedParticipantPickerForTransactionID === activeTransactionID ||
            (shouldAutoOpenParticipantPicker && dismissedAutoOpenParticipantPickerForTransactionID !== activeTransactionID));

    const closeParticipantPicker = useCallback(() => {
        setManuallyOpenedParticipantPickerForTransactionID(undefined);
        if (!activeTransactionID) {
            return;
        }
        setDismissedAutoOpenParticipantPickerForTransactionID(activeTransactionID);
    }, [activeTransactionID]);

    const handleParticipantsAdded = useCallback(
        (participantsList: Participant[]) => {
            if (!activeTransactionID) {
                return;
            }
            const selectedParticipant = participantsList.at(0);
            // P2P chats don't support negative amounts. When a negative amount was entered before a participant
            // was selected (e.g. "Submit it to someone" from a self DM), assigning it to a P2P participant would
            // fail at submit, so keep the expense on the self DM (its default) instead of assigning the P2P
            // participant, stopping the user at selection rather than at submit. This only applies while the
            // expense is still on the self DM — a negative expense already bound to a policy expense chat (e.g.
            // global create auto-assigned the default workspace) must stay on that workspace rather than being
            // silently converted into a personal track expense.
            const isTransactionOnPolicyExpenseChat = transaction?.participants?.some((participant) => participant?.isPolicyExpenseChat);
            const shouldKeepOnSelfDM = !!selectedParticipant?.isSelfDM || ((transaction?.amount ?? 0) < 0 && !isTransactionOnPolicyExpenseChat && isParticipantP2P(selectedParticipant));
            if (shouldKeepOnSelfDM) {
                setMoneyRequestParticipantsFromReport(activeTransactionID, selfDMReport, currentUserPersonalDetails.accountID);
                setTransactionReport(activeTransactionID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);
                navigation.setParams({iouType: CONST.IOU.TYPE.TRACK});
            } else {
                if (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK) {
                    navigation.setParams({iouType: CONST.IOU.TYPE.CREATE});
                }
                setMoneyRequestParticipants(activeTransactionID, participantsList);
                const firstParticipant = participantsList.at(0);
                if (iouType !== CONST.IOU.TYPE.SPLIT && firstParticipant) {
                    const isPolicyExpenseChatParticipant = !!firstParticipant.isPolicyExpenseChat;

                    // A brand-new recipient picked by email has no chat yet (no reportID). Reusing the route's `reportID`
                    // (which points at the flow's origin report - e.g. the default workspace chat this distance flow was
                    // seeded with) leaves the expense bound to that workspace, so the backend rejects it with
                    // "There is a previously existing chat between these users." Generate a fresh optimistic reportID for
                    // P2P recipients, mirroring the legacy participants-step flow (useParticipantSubmission).
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    const participantReportID = firstParticipant.reportID || (isPolicyExpenseChatParticipant ? reportID : generateReportID());
                    setTransactionReport(activeTransactionID, {reportID: participantReportID}, true);

                    // When switching from the auto-assigned default workspace to a P2P recipient we must also undo the
                    // workspace-specific defaults the distance step applied: reset the mileage rate to the P2P rate and
                    // clear the workspace's default category (and the category-derived tax). Otherwise the confirmation
                    // keeps the workspace "Default Rate"/category and the expense stays bound to that workspace. This
                    // mirrors what the legacy addParticipant/goToNextStep path does when a P2P recipient is selected.
                    if (!isPolicyExpenseChatParticipant) {
                        if (isDistanceRequest) {
                            const p2pRateID = DistanceRequestUtils.getCustomUnitRateID({
                                reportID: firstParticipant.reportID,
                                isPolicyExpenseChat: false,
                                policy: undefined,
                                lastSelectedDistanceRates,
                                expenseDate: transaction?.created,
                            });
                            setCustomUnitRateID(activeTransactionID, p2pRateID, transaction, undefined, false, personalPolicy?.outputCurrency);
                        }
                        setMoneyRequestCategory(activeTransactionID, '', undefined);
                    }
                }
            }
            if (participantsList.length > 0) {
                closeParticipantPicker();
            }
        },
        [
            activeTransactionID,
            closeParticipantPicker,
            currentUserPersonalDetails.accountID,
            navigation,
            selfDMReport,
            iouType,
            reportID,
            isDistanceRequest,
            lastSelectedDistanceRates,
            transaction,
            personalPolicy?.outputCurrency,
        ],
    );

    useEffect(() => {
        if (!transaction?.transactionID) {
            return;
        }

        const transactionParticipants = transaction?.participants ?? [];
        const hasTransactionParticipants = transactionParticipants.length > 0;
        const hasDefaultParticipants = defaultParticipants.length > 0;

        if (hasTransactionParticipants || !hasDefaultParticipants) {
            return;
        }

        setMoneyRequestParticipants(transaction.transactionID, defaultParticipants);
        const firstDefault = defaultParticipants.at(0);
        if (firstDefault?.isSelfDM) {
            setTransactionReport(transaction.transactionID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);
            navigation.setParams({iouType: CONST.IOU.TYPE.TRACK});
        } else if (firstDefault?.reportID) {
            setTransactionReport(transaction.transactionID, {reportID: firstDefault.reportID}, true);
        }
    }, [transaction?.transactionID, transaction?.participants, defaultParticipants, isNewManualExpenseFlowEnabled, isManualRequest, navigation]);

    const isPolicyExpenseChat = useMemo(() => {
        const hasPolicyExpenseChat = (participantList: typeof defaultParticipants) =>
            participantList.some((participant) => {
                if (isPolicyExpenseChatUtils(participant)) {
                    return true;
                }

                return !!participant?.reportID && isPolicyExpenseChatUtils(getReportOrDraftReport(participant.reportID));
            });

        if (isPolicyExpenseChatUtils(report)) {
            return true;
        }

        const transactionParticipants = transaction?.participants ?? [];
        if (hasPolicyExpenseChat(transactionParticipants)) {
            return true;
        }

        return hasPolicyExpenseChat(defaultParticipants);
    }, [report, transaction?.participants, defaultParticipants]);

    const isFromGlobalCreate = transaction?.isFromGlobalCreate === true || transaction?.isFromFloatingActionButton === true;

    useFetchRoute(transaction, transaction?.comment?.waypoints, action, shouldUseTransactionDraft(action, iouType) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT);

    const policyExpenseChatPolicyID =
        transaction?.participants?.find((participant) => participant?.isPolicyExpenseChat)?.policyID ??
        defaultParticipants.find((participant) => participant?.isPolicyExpenseChat)?.policyID ??
        (isPolicyExpenseChatUtils(report) ? report?.policyID : undefined);

    const senderPolicyID = transaction?.participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender)?.policyID;

    const {
        hasVerifiedBlobs,
        isReady: isOdometerReady,
        isStitching: isStitchingReceipt,
        error: stitchError,
    } = useOdometerReceiptStitcher({
        transaction,
        isOdometerDistanceRequest,
        reportID,
        iouType,
        backToReport,
    });

    // PAY, SPLIT, and TRACK navigate to a specific destination report
    // (not Search) after submission. Pre-inserting the Search route would leave
    // a stale entry in the navigation stack.
    const canPreInsertSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT && iouType !== CONST.IOU.TYPE.TRACK;

    const {createTransaction, sendMoney, isConfirmed, setIsConfirmed, formHasBeenSubmitted} = useExpenseSubmission({
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
        requestType,
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
    });

    // handleSearchDismiss doesn't pre-insert - it just dismisses the modal when search is
    // already on top. This is safe for per-diem TRACK (which navigates to self-DM, but when
    // search is on top dismissModalAndOpenReportInInboxTab only dismisses). SPLIT/PAY need
    // dedicated handling because they preserve Search from Spend but reveal a report from
    // other tabs.
    const canDismissFromSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT;

    const hasPreInsertFired = useRef(false);
    const isTransactionReady = !!transaction;
    const selfDMReportID = iouType === CONST.IOU.TYPE.TRACK ? findSelfDMReportID() : undefined;
    const isMRReport = isMoneyRequestReport(report);
    const destinationReportID =
        backToReport ?? (isPerDiemRequest && isMRReport && Navigation.getTopmostReportId() !== report?.reportID ? report?.chatReportID : report?.reportID) ?? selfDMReportID;
    const [destinationReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${destinationReportID}`);

    useEffect(() => {
        if (hasPreInsertFired.current || !isTransactionReady || !getIsNarrowLayout()) {
            return;
        }

        // Search pre-insert: global create flows that navigate to Search after submit.
        // Also pre-insert when Search is already on top but showing a different type
        // (e.g. Invoice tab when submitting an Expense) so the correct tab is revealed on dismiss.
        const searchType = iouType === CONST.IOU.TYPE.INVOICE ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;
        const isSearchOnTopWithDifferentType = isSearchTopmostFullScreenRoute() && getCurrentSearchQueryJSON()?.type !== searchType;
        const shouldPreInsertSearch = isFromGlobalCreate && canPreInsertSearch && !isReportTopmostSplitNavigator() && (!isSearchTopmostFullScreenRoute() || isSearchOnTopWithDifferentType);

        // Report pre-insert: dismiss modal flows that open an existing report after submit.
        // Skip when the destination is already the topmost fullscreen report to avoid
        // pushing a duplicate route (which would require an extra back press).

        // Only eligible when search pre-insert didn't win, and the flow ends at a report (not Search).
        // When Search is the topmost fullscreen and there's no report context (e.g. QAB from Spend tab),
        // pre-inserting a report is wrong - the user should stay on Search after submission.
        // Global-create TRACK targets self-DM, PAY and SPLIT target a specific chat report,
        // so they are also eligible for report pre-insert when Search is NOT topmost.
        // When on Search/Spend the user should stay there after submission.
        const isReportBoundGlobalCreate = iouType === CONST.IOU.TYPE.PAY || iouType === CONST.IOU.TYPE.SPLIT;
        const canUseReportPreInsert =
            !shouldPreInsertSearch &&
            (isReportTopmostSplitNavigator() || (!isSearchTopmostFullScreenRoute() && (isCreatingTrackExpense || isReportBoundGlobalCreate || !isFromGlobalCreate)));

        // RHP has its own dismiss handler; pre-inserting under it would break the stack.
        const isOutsideRHP = !isReportOpenInRHP(navigationRef.getRootState());

        // Don't pre-insert if the report is already showing - it would push a duplicate route.
        const hasValidDestination = !!destinationReportID && Navigation.getTopmostReportId() !== destinationReportID;

        // The report must be in Onyx so the pre-inserted screen can render immediately.
        const isDestinationReportLoaded = !!destinationReportID && !!getReportOrDraftReport(destinationReportID, undefined, undefined, undefined, destinationReport)?.reportID;

        const shouldPreInsertReport = canUseReportPreInsert && isOutsideRHP && hasValidDestination && isDestinationReportLoaded;

        if (!shouldPreInsertSearch && !shouldPreInsertReport) {
            return;
        }

        hasPreInsertFired.current = true;

        const preInsertFullscreenRoute: Route = shouldPreInsertSearch
            ? ROUTES.SEARCH_ROOT.getRoute({
                  query: buildCannedSearchQuery({type: searchType}),
              })
            : ROUTES.REPORT_WITH_ID.getRoute(destinationReportID);

        const timer = setTimeout(() => {
            Navigation.preInsertFullscreenUnderRHP(preInsertFullscreenRoute);
        }, CONST.PRE_INSERT_FULLSCREEN_DELAY);

        return () => {
            clearTimeout(timer);

            // eslint-disable-next-line react-hooks/exhaustive-deps -- formHasBeenSubmitted is a stable ref from useExpenseSubmission; reading .current in cleanup is intentional
            if (formHasBeenSubmitted.current) {
                return;
            }

            if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
                Navigation.removePreInsertedFullscreenIfNeeded();
            }

            // Allow the pre-insert to re-fire when dependencies change (e.g. destinationReportID
            // transitions from undefined to a valid ID after setTransactionReport resolves).
            // Without this reset, the guard would permanently block re-firing after the first
            // pre-insert was torn down due to a dependency change. This must run even when the
            // 300ms timer was cleared before the pre-insert could execute, otherwise the flag
            // stays true and blocks all subsequent attempts.
            hasPreInsertFired.current = false;
        };
        // isFromGlobalCreate, iouType, and canPreInsertSearch are stable for the lifetime of
        // this screen instance. isTransactionReady and destinationReportID may each flip once
        // (false -> true / undefined -> ID) as data loads asynchronously, re-triggering the effect.
        // The hasPreInsertFired reset enables at most one additional re-fire when
        // destinationReportID transitions from undefined to a valid ID. If destinationReportID
        // were to change from one valid ID to another (extremely unlikely with Onyx), the
        // pre-insert would re-fire once more, which is acceptable since the cleanup removes the
        // stale route first. Oscillation is not possible because setTransactionReport only fires
        // once during resetIOUTypeIfChanged.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTransactionReady, destinationReportID]);

    // Cancel the telemetry span when confirmation unmounts without a completed submission.
    // If getPendingSubmitFollowUpAction() is set, the orchestrator (or sendMoney flow) has
    // already taken ownership of the span lifecycle - do not interfere.
    useEffect(() => {
        return () => {
            if (!isTracking() || getPendingSubmitFollowUpAction()) {
                return;
            }
            cancelTracking();
        };
    }, []);

    const handleSendMoney = useCallback(
        (paymentMethod: PaymentMethodType | undefined) => {
            if (isConfirmed) {
                return;
            }

            if (paymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && paymentMethod !== CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                sendMoney(paymentMethod);
                return;
            }

            const participant = participants.at(0);
            if (!participant) {
                sendMoney(paymentMethod);
                return;
            }

            const resolvedReportIDs = resolveOptimisticChatReportID([participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID], report);
            const payDestinationReportID = destinationReportID ?? resolvedReportIDs.chatReportID;
            if (!payDestinationReportID || Navigation.getTopmostReportId() === payDestinationReportID) {
                sendMoney(paymentMethod, {resolvedReportIDs});
                return;
            }

            setIsConfirmed(true);
            submitWithDismissFirst({
                executeWrite: (overrides) =>
                    sendMoney(paymentMethod, {
                        shouldHandleNavigation: overrides.shouldHandleNavigation,
                        resolvedReportIDs,
                        shouldStartTracking: false,
                        shouldDeferForSearch: false,
                    }),
                destinationReportID: payDestinationReportID,
                telemetryContext: {
                    scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.SEND_MONEY,
                    iouType: CONST.IOU.TYPE.PAY,
                    requestType: CONST.IOU.TYPE.PAY,
                    isFromGlobalCreate: !report?.reportID,
                    hasReceipt: !!transaction?.receipt,
                },
            });
        },
        [currentUserPersonalDetails.accountID, destinationReportID, isConfirmed, setIsConfirmed, participants, report, sendMoney, transaction?.receipt],
    );

    const navigateBack = useCallback(() => {
        // User is explicitly abandoning the flow - cancel any active telemetry span.
        // The orchestrator never calls navigateBack (it uses dismissModal), so this
        // reliably distinguishes user-initiated back from programmatic dismiss.
        cancelTracking();

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        // If the action is categorize and there's no policies other than personal one, we simply call goBack(), i.e: dismiss the whole flow together
        // We don't need to subscribe to policy_ collection as we only need to check on the latest collection value
        if (action === CONST.IOU.ACTION.CATEGORIZE) {
            Navigation.goBack();
            return;
        }
        if (isPerDiemRequest) {
            if (isMovingTransactionFromTrackExpense || isCreatingTrackExpense) {
                Navigation.goBack();
                return;
            }
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, initialTransactionID, reportID, backToReport));
            return;
        }

        if (transaction?.isFromGlobalCreate && !transaction.receipt?.isTestReceipt) {
            // If the participants weren't automatically added to the transaction, then we should go back to the IOURequestStepParticipants.
            if (!transaction?.participantsAutoAssigned && participantsAutoAssignedFromRoute !== 'true') {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, initialTransactionID, transaction?.reportID || reportID, undefined, action), {
                    compareParams: false,
                });
                return;
            }

            // If the participant was auto-assigned, we need to keep the reportID that is already on the stack.
            // This will allow the user to edit the participant field after going back and forward.
            Navigation.goBack();
            return;
        }

        // This has selected the participants from the beginning and the participant field shouldn't be editable.
        navigateToStartMoneyRequestStep(requestType, iouType, initialTransactionID, reportID, action, backToReport);
    }, [
        action,
        isPerDiemRequest,
        isCreatingTrackExpense,
        transaction?.isFromGlobalCreate,
        transaction?.receipt?.isTestReceipt,
        transaction?.participantsAutoAssigned,
        transaction?.reportID,
        requestType,
        iouType,
        initialTransactionID,
        reportID,
        isMovingTransactionFromTrackExpense,
        participantsAutoAssignedFromRoute,
        backTo,
        backToReport,
    ]);

    const setBillable = useCallback(
        (billable: boolean) => {
            setMoneyRequestBillable(currentTransactionID, billable);
        },
        [currentTransactionID],
    );

    const setReimbursable = useCallback(
        (reimbursable: boolean) => {
            setMoneyRequestReimbursable(currentTransactionID, reimbursable);
        },
        [currentTransactionID],
    );

    // This loading indicator is shown because the transaction originalCurrency is being updated later than the component mounts.
    // To prevent the component from rendering with the wrong currency, we show a loading indicator until the correct currency is set.
    const isLoading = !!transaction?.originalCurrency;

    // Submit orchestration (fast-path selection, telemetry, navigation) is handled
    // by SubmitExpenseOrchestrator which wraps MoneyRequestConfirmationList below.

    /**
     * Sets the Receipt object when dragging and dropping a file
     */
    const setReceiptOnDrop = (files: FileObject[]) => {
        const file = files.at(0);
        if (!file) {
            return;
        }
        const source = URL.createObjectURL(file as Blob);
        setMoneyRequestReceipt(currentTransactionID, source, file.name ?? '', true, file.type);
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(setReceiptOnDrop);

    const handleDroppingReceipt = (e: DragEvent) => {
        const file = e?.dataTransfer?.files[0];
        if (file) {
            file.uri = URL.createObjectURL(file);
            validateFiles([file], Array.from(e.dataTransfer?.items));
        }
    };

    if (isLoadingTransaction) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'IOURequestStepConfirmation',
            isLoadingTransaction,
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    const showNextTransaction = () => {
        const nextTransaction = transactions.at(currentTransactionIndex + 1);
        if (nextTransaction) {
            setCurrentTransactionID(nextTransaction.transactionID);
        }
    };

    const showPreviousTransaction = () => {
        const previousTransaction = transactions.at(currentTransactionIndex - 1);
        if (previousTransaction) {
            setCurrentTransactionID(previousTransaction.transactionID);
        }
    };

    const removeCurrentTransaction = () => {
        if (currentTransactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
            const nextTransaction = transactions.at(currentTransactionIndex + 1);
            replaceDefaultDraftTransaction(nextTransaction);
            return;
        }

        removeDraftTransaction(currentTransactionID);
        showPreviousTransaction();
    };

    const confirmRemoveCurrentTransaction = async () => {
        const result = await showConfirmModal({
            title: translate('iou.removeExpense'),
            prompt: translate('iou.removeExpenseConfirmation'),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
            danger: true,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        removeCurrentTransaction();
    };

    const showReceiptEmptyState = shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);

    const shouldShowSmartScanFields = !!transaction?.receipt?.isTestDriveReceipt || isMovingTransactionFromTrackExpense || requestType !== CONST.IOU.REQUEST_TYPE.SCAN;
    return (
        <ScreenWrapper
            shouldEnableMaxHeight={canUseTouchScreen() && !isMobileSafari()}
            shouldAvoidScrollOnVirtualViewport={!isMobileSafari()}
            testID="IOURequestStepConfirmation"
        >
            <TelemetrySpanManager iouType={iouType} />
            <DraftWorkspaceOpener
                isCreatingTrackExpense={isCreatingTrackExpense}
                policyID={policyID}
                policyPendingAction={policy?.pendingAction}
                policyExpenseChatPolicyID={policyExpenseChatPolicyID}
                senderPolicyID={senderPolicyID}
                isOffline={isOffline}
            />
            <ExpenseDefaultsSetter
                transactionIDs={transactionIDs}
                policy={policy}
                isPolicyExpenseChat={isPolicyExpenseChat}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                isCreatingTrackExpense={isCreatingTrackExpense}
            />
            {/*
             * When this screen is embedded on IOURequestStartPage (shouldHideHeader=true),
             * skip MoneyRequestInitializer to avoid duplicate initialization and navigation side effects.
             */}
            {!shouldHideHeader && (
                <MoneyRequestInitializer
                    isLoadingTransaction={!!isLoadingTransaction}
                    transaction={transaction}
                    iouType={iouType}
                    reportID={reportID}
                    draftTransactionIDs={draftTransactionIDs}
                />
            )}
            <CategoryDefaultsSetter
                transactions={transactions}
                transactionIDs={transactionIDs}
                existingTransaction={existingTransaction}
                policyCategories={policyCategories}
                policy={policy}
                isDistanceRequest={isDistanceRequest}
                requestType={requestType}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
            />
            <ReceiptFileValidator
                transactions={transactions}
                requestType={requestType}
                iouType={iouType}
                initialTransactionID={initialTransactionID}
                reportID={reportID}
                action={action}
                backToReport={backToReport}
                report={report}
                participants={participants}
                draftTransactionIDs={draftTransactionIDs}
                isReceiptReady={!isOdometerDistanceRequest || isOdometerReady}
                onReceiptFilesChange={setReceiptFiles}
            />
            <DragAndDropProvider isDisabled={!showReceiptEmptyState || isOdometerDistanceRequest}>
                <View style={styles.flex1}>
                    {/*
                     * Keep a single header in embedded mode: IOURequestStartPage renders the parent header,
                     * so this inner header must be hidden to prevent duplicate back buttons and title layout issues.
                     */}
                    {!shouldHideHeader && (
                        <HeaderWithBackButton
                            title={headerTitle}
                            subtitle={hasMultipleTransactions ? `${currentTransactionIndex + 1} ${translate('common.of')} ${transactions.length}` : undefined}
                            onBackButtonPress={navigateBack}
                            /** Skip focus of the first interactive element in the header to make sure that Enter key submits the expense on the confirmation page instead of navigating back.  */
                            shouldSkipFocusAfterTransition
                        >
                            {hasMultipleTransactions ? (
                                <PrevNextButtons
                                    isPrevButtonDisabled={currentTransactionIndex === 0}
                                    isNextButtonDisabled={currentTransactionIndex === transactions.length - 1}
                                    onNext={() => startTransition(showNextTransaction)}
                                    onPrevious={() => startTransition(showPreviousTransaction)}
                                />
                            ) : null}
                        </HeaderWithBackButton>
                    )}
                    {(isLoading || (isScanRequest(transaction) && !Object.values(receiptFiles).length)) && (
                        <FullScreenLoadingIndicator
                            reasonAttributes={{
                                context: 'IOURequestStepConfirmation',
                                isLoading,
                                isScanRequestWithNoReceipts: isScanRequest(transaction) && !Object.values(receiptFiles).length,
                            }}
                        />
                    )}
                    {PDFValidationComponent}
                    <DragAndDropConsumer onDrop={handleDroppingReceipt}>
                        <DropZoneUI
                            icon={isEditingReceipt ? expensifyIcons.ReplaceReceipt : expensifyIcons.SmartScan}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTitle={translate(isEditingReceipt ? 'dropzone.replaceReceipt' : 'quickAction.scanReceipt')}
                            dropTextStyles={styles.receiptDropText}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {ErrorModal}
                    <SubmitExpenseOrchestrator
                        createTransaction={createTransaction}
                        destinationReportID={destinationReportID}
                        isFromGlobalCreate={isFromGlobalCreate}
                        iouType={iouType}
                        requestType={requestType}
                        canDismissFromSearch={canDismissFromSearch}
                        gpsRequired={!!gpsRequired}
                        lastLocationPermissionPrompt={lastLocationPermissionPrompt}
                        isDistanceRequest={isDistanceRequest}
                        isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                        isUnreported={isUnreported}
                        isCategorizingTrackExpense={isCategorizingTrackExpense}
                        isSharingTrackExpense={isSharingTrackExpense}
                        isPerDiemRequest={isPerDiemRequest}
                        receiptFiles={receiptFiles}
                        isFromGlobalCreateOnTransaction={!!transaction?.isFromGlobalCreate}
                        isFromFloatingActionButtonOnTransaction={!!transaction?.isFromFloatingActionButton}
                        isFromNativeShortcutOnTransaction={!!transaction?.isFromNativeShortcut}
                    >
                        {({onConfirm, isConfirming}) => (
                            <MoneyRequestConfirmationList
                                transaction={transaction}
                                selectedParticipants={participants}
                                isParticipantPickerVisible={isParticipantPickerVisible}
                                onOpenParticipantPicker={() => {
                                    if (!activeTransactionID) {
                                        return;
                                    }
                                    setManuallyOpenedParticipantPickerForTransactionID(activeTransactionID);
                                }}
                                onToggleBillable={setBillable}
                                onConfirm={onConfirm}
                                onSendMoney={handleSendMoney}
                                showRemoveExpenseConfirmModal={() => {
                                    confirmRemoveCurrentTransaction();
                                }}
                                receiptPath={receiptPath}
                                receiptFilename={receiptFilename}
                                iouType={iouType as Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>}
                                reportID={reportID}
                                shouldDisplayReceipt={
                                    !isMovingTransactionFromTrackExpense && (!isDistanceRequest || isManualDistanceRequest || isOdometerDistanceRequest) && !isPerDiemRequest
                                }
                                isPolicyExpenseChat={isPolicyExpenseChat}
                                policyID={policyID}
                                isOdometerDistanceRequest={isOdometerDistanceRequest}
                                isLoadingReceipt={isStitchingReceipt || (isOdometerDistanceRequest && !hasVerifiedBlobs)}
                                receiptStitchError={stitchError}
                                isPerDiemRequest={isPerDiemRequest}
                                shouldShowSmartScanFields={shouldShowSmartScanFields}
                                action={action}
                                isConfirmed={isConfirmed}
                                isConfirming={isConfirming}
                                onToggleReimbursable={setReimbursable}
                                expensesNumber={transactions.length}
                                isReceiptEditable
                                isTimeRequest={isTimeRequest}
                                shouldHideToSection={shouldHideToSection}
                            />
                        )}
                    </SubmitExpenseOrchestrator>
                    {isNewManualExpenseFlowEnabled && (
                        <ParticipantPicker
                            participants={participants}
                            iouType={participantPickerIOUType}
                            action={action}
                            isPerDiemRequest={isPerDiemRequest}
                            isTimeRequest={isTimeRequest}
                            isWorkspacesOnly={getIsWorkspacesOnlyForTransaction(transaction, requestType)}
                            shouldExcludeP2P={(transaction?.amount ?? 0) < 0}
                            onParticipantsAdded={handleParticipantsAdded}
                            onFinish={closeParticipantPicker}
                            isVisible={isParticipantPickerVisible}
                            onClose={closeParticipantPicker}
                            // Clicking the backdrop (outside the panel) should dismiss the whole expense creation RHP,
                            // matching standard RHP behavior, not just close the stacked participant picker.
                            onBackdropPress={() => Navigation.dismissModal()}
                        />
                    )}
                </View>
            </DragAndDropProvider>
        </ScreenWrapper>
    );
}

const IOURequestStepConfirmationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmation);

const IOURequestStepConfirmationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationWithFullTransactionOrNotFound);

export default IOURequestStepConfirmationWithWritableReportOrNotFound;
