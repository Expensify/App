import ActivityIndicator from '@components/ActivityIndicator';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LoadingIndicator from '@components/LoadingIndicator';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ParticipantPicker from '@components/ParticipantPicker';
import PrevNextButtons from '@components/PrevNextButtons';
import ScreenWrapper from '@components/ScreenWrapper';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFetchRoute from '@hooks/useFetchRoute';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOdometerReceiptStitcher from '@hooks/useOdometerReceiptStitcher';
import useOnyx from '@hooks/useOnyx';
import useParticipantsPolicies from '@hooks/useParticipantsPolicies';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setMoneyRequestBillable, setMoneyRequestReimbursable} from '@libs/actions/IOU/MoneyRequest';
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getIsWorkspacesOnlyForTransaction,
    getSelectedWorkspacePolicyID,
    isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils,
    isSelfDMSoleDestination,
    isLookingAroundSearchRoutingActive,
    navigateToStartMoneyRequestStep,
    pickReportForPolicy,
    resolveReportForMoneyRequest,
    shouldShowReceiptEmptyState,
    shouldUseTransactionDraft,
} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {getReportOrDraftReport, isMoneyRequestReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import {cancelTracking, getPendingSubmitFollowUpAction, isTracking} from '@libs/telemetry/submitFollowUpAction';
import {
    getRequestType,
    hasReceipt,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isPartiallyEnteredScanExpense,
    isScanRequest,
} from '@libs/TransactionUtils';

import CategoryDefaultsSetter from '@pages/iou/request/step/confirmation/CategoryDefaultsSetter';
import DraftWorkspaceOpener from '@pages/iou/request/step/confirmation/DraftWorkspaceOpener';
import ExpenseDefaultsSetter from '@pages/iou/request/step/confirmation/ExpenseDefaultsSetter';
import MoneyRequestInitializer from '@pages/iou/request/step/confirmation/MoneyRequestInitializer';
import ReceiptFileValidator from '@pages/iou/request/step/confirmation/ReceiptFileValidator';
import useSubmitLock from '@pages/iou/request/step/confirmation/submission/useSubmitLock';
import {resolveSubmissionPath, SUBMISSION_PATH} from '@pages/iou/request/step/confirmation/submission/utils/resolveSubmissionPath';
import TelemetrySpanManager from '@pages/iou/request/step/confirmation/TelemetrySpanManager';
import type {UseExpenseSubmissionParams} from '@pages/iou/request/step/confirmation/useExpenseSubmission';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';

import {getIOURequestPolicyID, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {startTransition, useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import type {IOURequestStepConfirmationProps, StepConfirmationParams} from './types';
import type {ConfirmationVariantProps} from './variants/types';

import useConfirmationTransactionPager from './useConfirmationTransactionPager';
import useParticipantPickerState from './useParticipantPickerState';
import useSubmitDestinationPreMount from './useSubmitDestinationPreMount';
import InvoiceConfirmation from './variants/InvoiceConfirmation';
import LegacyConfirmation from './variants/LegacyConfirmation';
import PayConfirmation from './variants/PayConfirmation';
import PerDiemConfirmation from './variants/PerDiemConfirmation';

function IOURequestStepConfirmationContent({
    report: reportReal,
    reportDraft,
    route,
    transaction: initialTransaction,
    isLoadingTransaction,
    shouldHideHeader = false,
    navigation,
}: IOURequestStepConfirmationProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const params = route.params;
    const {iouType, reportID, transactionID: initialTransactionID, action, backToReport, backTo} = params;
    const participantsAutoAssignedFromRoute = route.name === SCREENS.MONEY_REQUEST.STEP_CONFIRMATION ? (params as StepConfirmationParams).participantsAutoAssigned : undefined;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();

    const {
        transactions,
        transaction,
        existingTransaction,
        currentTransactionID,
        currentTransactionIndex,
        setCurrentTransactionID,
        showNextTransaction,
        showPreviousTransaction,
        confirmRemoveCurrentTransaction,
    } = useConfirmationTransactionPager(initialTransaction, initialTransactionID);
    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${initialTransaction?.participants?.at(0)?.reportID}`);
    const hasMultipleTransactions = transactions.length > 1;

    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const transactionIDs = useMemo(() => transactions?.map((transaction) => transaction.transactionID), [transactions.length]);
    const requestType = getRequestType(transaction);
    const isPerDiemRequest = requestType === CONST.IOU.REQUEST_TYPE.PER_DIEM;
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const selectedWorkspacePolicyID = getSelectedWorkspacePolicyID(initialTransaction, action);
    // A workspace with submissions (delayed submission) disabled has no autoReporting, so the new flow seeds the
    // expense onto the self-DM, whose report carries the placeholder '_FAKE_' policy. After selecting that workspace
    // chat via the in-place "To" picker, the route report is still that self-DM; its fake policyID must not shadow
    // the selected participant's report, or the workspace expense fields (Category, etc.) never resolve. See #96576.
    const realPolicyID = selectedWorkspacePolicyID ?? getIOURequestPolicyID(initialTransaction, pickReportForPolicy(reportReal, participantReport));
    const draftPolicyID = getIOURequestPolicyID(initialTransaction, reportDraft);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${draftPolicyID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [reportNameValuePair] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

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
                reportNameValuePair,
                rules,
            }),
        [transaction, transactionReport, reportWithDraftFallback, reportNameValuePair, rules],
    );
    const [reportDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT);

    const {policy} = usePolicyForTransaction({
        transaction: initialTransaction,
        reportPolicyID: realPolicyID ?? draftPolicyID,
        action,
        iouType,
        // Forward the draft policy so a freshly created draft workspace (e.g. "Submit to my employer" with no existing
        // workspace) resolves here. Without it `policy` is undefined for drafts, `isDraftPolicy` is false, and the submit
        // is routed to ConvertTrackedExpenseToRequest (which needs a real payer) instead of AddTrackedExpenseToPolicy.
        policyDraft,
        isPerDiemRequest,
    });
    const policyID = policy?.id;
    const isDraftPolicy = policy === policyDraft;

    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${draftPolicyID}`);
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);

    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: validTransactionDraftIDsSelector,
    });

    const reportAttributesDerived = useReportAttributes();

    const policyCategories = isDraftPolicy && draftPolicyID ? policyCategoriesDraft : policyCategoriesReal;

    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, dateFnsLocale} = useLocalize();
    const {isOffline} = useNetwork();
    // isConfirming, selectedParticipantList, and startLocationPermissionFlow state
    // moved to SubmitExpenseOrchestrator.

    const [receiptFiles, setReceiptFiles] = useState<Record<string, Receipt>>({});
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isManualRequest = transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL;
    const isOdometerDistanceRequest = isOdometerDistanceRequestTransactionUtils(transaction);
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: policy?.id,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });
    const isTimeRequest = requestType === CONST.IOU.REQUEST_TYPE.TIME;
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const isLookingAroundUser = isLookingAroundSearchRoutingActive(introSelected?.choice === CONST.ONBOARDING_CHOICES.LOOKING_AROUND, isOffline);
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const receiptFilename = transaction?.receipt?.filename;
    const receiptPath = transaction?.receipt?.source;
    const isEditingReceipt = hasReceipt(transaction);
    const isSharingTrackExpense = action === CONST.IOU.ACTION.SHARE;
    const isCategorizingTrackExpense = action === CONST.IOU.ACTION.CATEGORIZE;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    // The user can fill in the amount, merchant and date on the Scan tab instead of waiting for SmartScan, so the Scan
    // confirmation reveals those fields behind "Show more" as well. This only applies to a scan being created: a
    // tracked expense being moved already carries real values, and its emptiness
    // can't be told from the `isAmountSet` / `isMerchantSet` / `isCreatedSet` flags a fresh draft uses. Splits are
    // excluded too because StartSplitBill takes no amount/merchant/date (the details are filled in once the receipt
    // has been scanned), and so are test receipts, whose values are fixed.
    const canEnterScanFieldsManually =
        requestType === CONST.IOU.REQUEST_TYPE.SCAN &&
        !isMovingTransactionFromTrackExpense &&
        iouType !== CONST.IOU.TYPE.SPLIT &&
        !transaction?.receipt?.isTestReceipt &&
        !transaction?.receipt?.isTestDriveReceipt;

    // The confirmation only validates the transaction it shows, so find the partially filled one across all receipts.
    const partiallyManuallyFilledScanID = transactions.find((item) => isPartiallyEnteredScanExpense(item, canEnterScanFieldsManually))?.transactionID;

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
                // participantsPolicies only holds persisted policies, so fall back to the transaction policy when it's this
                // participant's workspace — e.g. a freshly created draft workspace ("Submit to my employer" with no existing one).
                const participantPolicy = (participant.policyID ? participantsPolicies[participant.policyID] : policy) ?? (participant.policyID === policy?.id ? policy : undefined);
                // Phone contacts always have an optimistic accountID but no reportID; getReportOption
                // is designed for report-backed participants and discards participant.text, so route
                // any participant without a reportID to getParticipantsOption instead.
                return participant.accountID || !participant.reportID
                    ? getParticipantsOption(participant, personalDetails, translate)
                    : getReportOption({
                          participant,
                          privateIsArchived,
                          policy: participantPolicy,
                          personalDetails,
                          conciergeReportID,
                          reportAttributesDerived,
                          reportDraft: participantReportDraft,
                          currentUserAccountID: currentUserPersonalDetails.accountID,
                          localize: {translate, dateFnsLocale, convertToDisplayString},
                          rules,
                          // Passing pendingDeleteMemberAccountIDs as undefined is intentional, isValidReport keeps group chats out of this list because the config here leaves includeMultipleParticipantReports false.
                          pendingDeleteMemberAccountIDs: undefined,
                      });
            }) ?? [],
        [
            dateFnsLocale,
            transaction?.participants,
            iouType,
            personalDetails,
            reportAttributesDerived,
            privateIsArchivedMap,
            participantsPolicies,
            policy,
            conciergeReportID,
            reportDrafts,
            translate,
            convertToDisplayString,
            currentUserPersonalDetails.accountID,
            rules,
        ],
    );

    const {
        defaultParticipants,
        isParticipantPickerVisible,
        participantPickerIOUType,
        openParticipantPicker,
        closeParticipantPicker,
        closeParticipantPickerForReferralNavigation,
        handleParticipantsAdded,
    } = useParticipantPickerState({
        transaction,
        iouType,
        reportID,
        reportDrafts,
        navigation,
        policyID,
        isDistanceRequest,
        isManualRequest,
        blockDistanceRequestIfNeeded,
    });

    const isPolicyExpenseChat = useMemo(() => {
        const hasPolicyExpenseChat = (participantList: typeof defaultParticipants) =>
            participantList.some((participant) => {
                if (isPolicyExpenseChatUtils(participant)) {
                    return true;
                }

                return (
                    !!participant?.reportID &&
                    isPolicyExpenseChatUtils(
                        getReportOrDraftReport(participant.reportID, undefined, undefined, reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${participant.reportID}`] ?? {}),
                    )
                );
            });

        if (isPolicyExpenseChatUtils(report)) {
            return true;
        }

        const transactionParticipants = transaction?.participants ?? [];
        if (hasPolicyExpenseChat(transactionParticipants)) {
            return true;
        }

        return hasPolicyExpenseChat(defaultParticipants);
    }, [report, transaction?.participants, defaultParticipants, reportDrafts]);

    const isFromGlobalCreate = transaction?.isFromGlobalCreate === true || transaction?.isFromFloatingActionButton === true;

    useFetchRoute(transaction, transaction?.comment?.waypoints, action, shouldUseTransactionDraft(action, iouType) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT, policy);

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

    const isSelfDMDestination = isSelfDMSoleDestination(participants, iouType, currentUserPersonalDetails.accountID);

    const submitLock = useSubmitLock();
    const {isConfirmed, formHasBeenSubmitted} = submitLock;

    const {destinationReportID, optimisticP2PDestinationReportID, preMountDestinationReportID, revealPreMountDestination, cleanupPreMount, onExpenseWriteWillStart} =
        useSubmitDestinationPreMount({
            transaction,
            report,
            reportDrafts,
            participants,
            iouType,
            backToReport,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            isPerDiemRequest,
            isFromGlobalCreate,
            isCreatingTrackExpense,
            isSelfDMDestination,
            isLookingAroundUser,
            isMovingTransactionFromTrackExpense,
            formHasBeenSubmitted,
        });

    const submissionParams: UseExpenseSubmissionParams = {
        reportDrafts,
        transaction,
        transactions,
        receiptFiles,
        canEnterScanFieldsManually,
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
        onExpenseWriteWillStart,
        submitLock,
    };

    // "Submit to my employer" with no existing workspace creates a draft Submit workspace, submitted through trackExpense.
    // Mirrors the same check in useExpenseSubmission; one of them goes away with that composer.
    const isSubmittingExpenseToDraftWorkspace = action === CONST.IOU.ACTION.SUBMIT && isDraftPolicy && policy?.type === CONST.POLICY.TYPE.SUBMIT;
    const submissionPath = resolveSubmissionPath({
        iouType,
        action,
        isDistanceRequest,
        isPerDiemRequest,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isSelfDMDestination,
        isMovingTransactionFromTrackExpense,
        isUnreported,
        isSubmittingExpenseToDraftWorkspace,
    });

    // handleSearchDismiss doesn't pre-insert - it just dismisses the modal when search is
    // already on top. This is safe for per-diem TRACK (which navigates to self-DM, but when
    // search is on top dismissModalAndOpenReportInInboxTab only dismisses). SPLIT/PAY need
    // dedicated handling because they preserve Search from Spend but reveal a report from
    // other tabs.
    const canDismissFromSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT;

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

    const navigateBack = useCallback(() => {
        // User is explicitly abandoning the flow - cancel any active telemetry span.
        // The orchestrator never calls navigateBack (it uses dismissModal), so this
        // reliably distinguishes user-initiated back from programmatic dismiss.
        cancelTracking();
        cleanupPreMount();

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
            Navigation.goBack(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(),
                    createDynamicRoute(
                        DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TIME.path,
                        createDynamicRoute(
                            DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESTINATION.path,
                            ROUTES.MONEY_REQUEST_CREATE.getRoute(action, iouType, initialTransactionID, reportID, backToReport),
                        ),
                    ),
                ),
            );
            return;
        }

        if (transaction?.isFromGlobalCreate && !transaction.receipt?.isTestReceipt) {
            // If the participants weren't automatically added to the transaction, then we should go back to the participants step.
            if (!transaction?.participantsAutoAssigned && participantsAutoAssignedFromRoute !== 'true') {
                Navigation.goBack(
                    createDynamicRoute(
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute({action, iouType, transactionID: initialTransactionID, reportID: transaction?.reportID || reportID}),
                        ROUTES.MONEY_REQUEST_CREATE.getRoute(action, iouType, initialTransactionID, reportID, backToReport),
                    ),
                    {compareParams: false},
                );
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
        // usePreMountDestination compiles under React Compiler, so cleanupPreMount has a stable identity (it closes over refs
        // only) - this dep does not churn navigateBack per render.
        cleanupPreMount,
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

    const {validateFiles, PDFValidationComponent} = useFilesValidation(setReceiptOnDrop);

    const handleDroppingReceipt = (e: DragEvent) => {
        const file = e?.dataTransfer?.files[0];
        if (file) {
            file.uri = URL.createObjectURL(file);
            validateFiles([file], Array.from(e.dataTransfer?.items));
        }
    };

    if (isLoadingTransaction) {
        // When embedded on IOURequestStartPage (shouldHideHeader), the parent header and tab bar stay visible,
        // so per UI-1 use ActivityIndicator (the user can still go back). In the standalone RHP route there is
        // no chrome behind this early return, so keep the fullscreen loader.
        return shouldHideHeader ? (
            <View style={[styles.flex1, styles.fullScreenLoading]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        ) : (
            <FullScreenLoadingIndicator shouldUseGoBackButton />
        );
    }

    const showReceiptEmptyState = shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);

    const shouldShowSmartScanFields =
        !!transaction?.receipt?.isTestDriveReceipt || isMovingTransactionFromTrackExpense || requestType !== CONST.IOU.REQUEST_TYPE.SCAN || canEnterScanFieldsManually;

    const orchestratorProps: ConfirmationVariantProps['orchestratorProps'] = {
        destinationReportID: preMountDestinationReportID,
        isFromGlobalCreate,
        iouType,
        isSelfDMDestination,
        isLookingAroundUser,
        requestType,
        canDismissFromSearch,
        gpsRequired: !!gpsRequired,
        isDistanceRequest,
        isMovingTransactionFromTrackExpense,
        isUnreported,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isPerDiemRequest,
        receiptFiles,
        isFromGlobalCreateOnTransaction: !!transaction?.isFromGlobalCreate,
        isFromFloatingActionButtonOnTransaction: !!transaction?.isFromFloatingActionButton,
        revealPreMountDestination,
    };

    const listProps: ConfirmationVariantProps['listProps'] = {
        transaction,
        selectedParticipants: participants,
        isParticipantPickerVisible,
        onOpenParticipantPicker: openParticipantPicker,
        onToggleBillable: setBillable,
        showRemoveExpenseConfirmModal: () => {
            confirmRemoveCurrentTransaction();
        },
        receiptOptions: {
            receiptPath,
            receiptFilename,
            shouldDisplayReceipt: !isMovingTransactionFromTrackExpense && (!isDistanceRequest || isManualDistanceRequest || isOdometerDistanceRequest) && !isPerDiemRequest,
            isLoadingReceipt: isStitchingReceipt || (isOdometerDistanceRequest && !hasVerifiedBlobs),
            isReceiptEditable: true,
        },
        iouType: iouType as Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>,
        reportID,
        isPolicyExpenseChat,
        policyID,
        isOdometerDistanceRequest,
        receiptStitchError: stitchError,
        isPerDiemRequest,
        shouldShowSmartScanFields,
        canEnterScanFieldsManually,
        partiallyManuallyFilledScanID,
        onSwitchToTransaction: setCurrentTransactionID,
        action,
        isConfirmed,
        onToggleReimbursable: setReimbursable,
        expensesNumber: transactions.length,
        isTimeRequest,
        shouldHideToSection,
    };

    const renderConfirmation = () => {
        // Pay confirms through SendMoney rather than createTransaction, so it isn't a submission path and is picked by iouType.
        if (iouType === CONST.IOU.TYPE.PAY) {
            return (
                <PayConfirmation
                    submissionParams={submissionParams}
                    listProps={listProps}
                    destinationReportID={destinationReportID}
                    optimisticP2PDestinationReportID={optimisticP2PDestinationReportID}
                />
            );
        }

        switch (submissionPath) {
            case SUBMISSION_PATH.INVOICE:
                return (
                    <InvoiceConfirmation
                        submissionParams={submissionParams}
                        orchestratorProps={orchestratorProps}
                        listProps={listProps}
                    />
                );
            case SUBMISSION_PATH.PER_DIEM:
                return (
                    <PerDiemConfirmation
                        submissionParams={submissionParams}
                        orchestratorProps={orchestratorProps}
                        listProps={listProps}
                    />
                );
            default:
                return (
                    <LegacyConfirmation
                        submissionParams={submissionParams}
                        orchestratorProps={orchestratorProps}
                        listProps={listProps}
                    />
                );
        }
    };

    return (
        <>
            <TelemetrySpanManager
                iouType={iouType}
                requestType={requestType}
                hasReceipt={!!transaction?.receipt}
            />
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
                canEnterScanFieldsManually={canEnterScanFieldsManually}
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
                    <View style={styles.flex1}>
                        {(isLoading || (isScanRequest(transaction) && !Object.values(receiptFiles).length)) && <LoadingIndicator />}
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
                        {renderConfirmation()}
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
                            onCloseForReferralNavigation={closeParticipantPickerForReferralNavigation}
                            // Clicking the backdrop (outside the panel) should dismiss the whole expense creation RHP,
                            // matching standard RHP behavior, not just close the stacked participant picker.
                            onBackdropPress={() => Navigation.dismissModal()}
                            shouldBlockParticipantSelection={blockDistanceRequestIfNeeded}
                        />
                    </View>
                </View>
            </DragAndDropProvider>
        </>
    );
}

/**
 * The standalone RHP route. It owns the chrome for this screen - the ScreenWrapper, its focus trap and its
 * viewport sizing - and renders the same body inside it. IOURequestStartPage composes the body directly instead,
 * because it already owns a trap whose containers are its header (with the Back button), its tab bar and the
 * active tab; a second ScreenWrapper there would push another FocusTrapForScreen onto the shared trap stack,
 * pause that one, and confine Tab to the confirmation form.
 */
function IOURequestStepConfirmation(props: IOURequestStepConfirmationProps) {
    return (
        <ScreenWrapper
            shouldEnableMaxHeight={canUseTouchScreen() && !isMobileSafari()}
            shouldAvoidScrollOnVirtualViewport={!isMobileSafari()}
            testID="IOURequestStepConfirmation"
        >
            <IOURequestStepConfirmationContent {...props} />
        </ScreenWrapper>
    );
}

const IOURequestStepConfirmationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmation);

const IOURequestStepConfirmationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationWithFullTransactionOrNotFound);

const IOURequestStepConfirmationContentWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmationContent);

const IOURequestStepConfirmationContentWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationContentWithFullTransactionOrNotFound);

export default IOURequestStepConfirmationWithWritableReportOrNotFound;

/** The body on its own, for a parent that already owns this screen's ScreenWrapper and focus trap. */
export {IOURequestStepConfirmationContentWithWritableReportOrNotFound};
