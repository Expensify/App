import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import {usePersonalDetails, usePolicyCategories} from '@components/OnyxListItemProvider';
import PrevNextButtons from '@components/PrevNextButtons';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFetchRoute from '@hooks/useFetchRoute';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils,
    navigateToStartMoneyRequestStep,
    resolveReportForMoneyRequest,
    shouldShowReceiptEmptyState,
    shouldUseTransactionDraft,
} from '@libs/IOUUtils';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {getReportOrDraftReport, isMoneyRequestReport, isSelectedManagerMcTest} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {
    getRequestType,
    hasReceipt,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isScanRequest,
} from '@libs/TransactionUtils';
import {getIOURequestPolicyID, setMoneyRequestBillable, setMoneyRequestParticipantsFromReport, setMoneyRequestReimbursable} from '@userActions/IOU';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {removeDraftTransaction, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import CategoryDefaultsSetter from './confirmation/CategoryDefaultsSetter';
import DraftWorkspaceOpener from './confirmation/DraftWorkspaceOpener';
import ExpenseDefaultsSetter from './confirmation/ExpenseDefaultsSetter';
import MoneyRequestInitializer from './confirmation/MoneyRequestInitializer';
import OdometerReceiptStitcher from './confirmation/OdometerReceiptStitcher';
import ReceiptFileValidator from './confirmation/ReceiptFileValidator';
import SubmitExpenseOrchestrator from './confirmation/SubmitExpenseOrchestrator';
import TelemetrySpanManager from './confirmation/TelemetrySpanManager';
import useExpenseSubmission from './confirmation/useExpenseSubmission';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepConfirmationProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION>;

function IOURequestStepConfirmation({
    report: reportReal,
    reportDraft,
    route: {
        params: {iouType, reportID, transactionID: initialTransactionID, action, participantsAutoAssigned: participantsAutoAssignedFromRoute, backToReport, backTo},
    },
    transaction: initialTransaction,
    isLoadingTransaction,
}: IOURequestStepConfirmationProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const allPolicyCategories = usePolicyCategories();

    const [transactions] = useOptimisticDraftTransactions(initialTransaction);
    const hasMultipleTransactions = transactions.length > 1;

    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const transactionIDs = useMemo(() => transactions?.map((transaction) => transaction.transactionID), [transactions.length]);
    // We will use setCurrentTransactionID later to switch between transactions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const realPolicyID = getIOURequestPolicyID(initialTransaction, reportReal);
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
    const transactionReport = getReportOrDraftReport(transaction?.reportID);
    const reportWithDraftFallback = useMemo(() => reportReal ?? reportDraft, [reportDraft, reportReal]);
    const shouldHideToSection = useMemo(() => isMoneyRequestReport(reportWithDraftFallback), [reportWithDraftFallback]);
    const report = useMemo(
        () => resolveReportForMoneyRequest({transaction, transactionReport, routeReport: reportWithDraftFallback, policy: policyReal}),
        [transaction, transactionReport, reportWithDraftFallback, policyReal],
    );

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

    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

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
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    // isConfirming, selectedParticipantList, and startLocationPermissionFlow state
    // moved to SubmitExpenseOrchestrator.

    const [receiptFiles, setReceiptFiles] = useState<Record<string, Receipt>>({});
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isOdometerDistanceRequest = isOdometerDistanceRequestTransactionUtils(transaction);
    const isTimeRequest = requestType === CONST.IOU.REQUEST_TYPE.TIME;
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const receiptFilename = transaction?.receipt?.filename;
    const receiptPath = transaction?.receipt?.source;
    const isEditingReceipt = hasReceipt(transaction);
    const isSharingTrackExpense = action === CONST.IOU.ACTION.SHARE;
    const isCategorizingTrackExpense = action === CONST.IOU.ACTION.CATEGORIZE;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const isTestTransaction = transaction?.participants?.some((participant) => isSelectedManagerMcTest(participant.login));

    const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).length && !isTestTransaction && isScanRequest(transaction);
    const [isStitchingReceipt, setIsStitchingReceipt] = useState(false);
    const [stitchError, setStitchError] = useState('');
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

    const participants = useMemo(
        () =>
            transaction?.participants?.map((participant) => {
                if (participant.isSender && iouType === CONST.IOU.TYPE.INVOICE) {
                    return participant;
                }
                const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`];
                return participant.accountID
                    ? getParticipantsOption(participant, personalDetails)
                    : getReportOption(participant, privateIsArchived, policy, personalDetails, conciergeReportID, reportAttributesDerived);
            }) ?? [],
        // getReportOrDraftReport (called inside getReportOption) falls back to its module-level allReportsDraft
        // connection, so we don't need to subscribe to COLLECTION.REPORT_DRAFT here.
        [transaction?.participants, iouType, personalDetails, reportAttributesDerived, privateIsArchivedMap, policy, conciergeReportID],
    );
    const isPolicyExpenseChat = useMemo(() => participants?.some((participant) => participant.isPolicyExpenseChat), [participants]);
    const isFromGlobalCreate = !!(transaction?.isFromGlobalCreate ?? transaction?.isFromFloatingActionButton);

    useFetchRoute(transaction, transaction?.comment?.waypoints, action, shouldUseTransactionDraft(action, iouType) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT);

    const policyExpenseChatPolicyID = participants?.find((participant) => participant.isPolicyExpenseChat)?.policyID;

    const senderPolicyID = participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender)?.policyID;

    const odometerStartImage = transaction?.comment?.odometerStartImage;
    const odometerEndImage = transaction?.comment?.odometerEndImage;

    // Pre-insert Search is only useful for flows whose submit ends in handleNavigateAfterExpenseCreate
    // (which navigates to Search). Flows that use dismissModalAndOpenReportInInboxTab (PAY,
    // SPLIT-from-global-create, per-diem self-DM track) navigate to a specific report instead,
    // so pre-inserting Search would leave a stale route in the stack.
    const canPreInsertSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT && !(isPerDiemRequest && iouType === CONST.IOU.TYPE.TRACK);

    const {createTransaction, sendMoney, isConfirmed, formHasBeenSubmitted} = useExpenseSubmission({
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
    // search is on top dismissModalAndOpenReportInInboxTab only dismisses). SPLIT/PAY still
    // can't use it because their navigation is coupled to the action function.
    const canDismissFromSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT;

    const hasPreInsertFired = useRef(false);
    const isTransactionReady = !!transaction;
    const destinationReportID = backToReport ?? report?.reportID;

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
        // Split flows handle their own dismiss/navigation, so pre-inserting would cause double navigation.
        const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
        const canUseReportPreInsert = !isSplitRequest && !shouldPreInsertSearch && (!isFromGlobalCreate || isReportTopmostSplitNavigator());

        // RHP has its own dismiss handler; pre-inserting under it would break the stack.
        const isOutsideRHP = !isReportOpenInRHP(navigationRef.getRootState());

        // Don't pre-insert if the report is already showing - it would push a duplicate route.
        const hasValidDestination = !!destinationReportID && Navigation.getTopmostReportId() !== destinationReportID;

        // The report must be in Onyx so the pre-inserted screen can render immediately.
        const isDestinationReportLoaded = !!destinationReportID && !!getReportOrDraftReport(destinationReportID)?.reportID;

        const shouldPreInsertReport = canUseReportPreInsert && isOutsideRHP && hasValidDestination && isDestinationReportLoaded;

        if (!shouldPreInsertSearch && !shouldPreInsertReport) {
            return;
        }

        hasPreInsertFired.current = true;

        const route: Route = shouldPreInsertSearch ? ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: searchType})}) : ROUTES.REPORT_WITH_ID.getRoute(destinationReportID);

        const timer = setTimeout(() => {
            Navigation.preInsertFullscreenUnderRHP(route);
        }, CONST.PRE_INSERT_FULLSCREEN_DELAY);

        return () => {
            clearTimeout(timer);

            // eslint-disable-next-line react-hooks/exhaustive-deps -- formHasBeenSubmitted is a stable ref from useExpenseSubmission; reading .current in cleanup is intentional
            if (!Navigation.getIsFullscreenPreInsertedUnderRHP() || formHasBeenSubmitted.current) {
                return;
            }

            Navigation.removePreInsertedFullscreenIfNeeded();
        };
        // isFromGlobalCreate, iouType, and canPreInsertSearch are stable for the lifetime of
        // this screen instance. isTransactionReady and destinationReportID may each flip once
        // (false -> true / undefined -> ID) as data loads asynchronously, re-triggering the effect.
        // hasPreInsertFired prevents double-firing. Note: if destinationReportID were to change
        // from one valid ID to another (extremely unlikely with Onyx), the pre-insert would not
        // re-fire. This is acceptable because the pre-inserted route is already correct for
        // the original destination, and the submit handler will navigate correctly regardless.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTransactionReady, destinationReportID]);

    const navigateBack = useCallback(() => {
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
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, initialTransactionID, reportID));
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

        // If the user came from Test Drive modal, we need to take him back there
        if (transaction?.receipt?.isTestDriveReceipt && (transaction.participants?.length ?? 0) > 0) {
            Navigation.goBack(ROUTES.TEST_DRIVE_MODAL_ROOT.getRoute(transaction.participants?.at(0)?.login));
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
        transaction?.receipt?.isTestDriveReceipt,
        transaction?.participants,
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
            <MoneyRequestInitializer
                isLoadingTransaction={!!isLoadingTransaction}
                transaction={transaction}
                iouType={iouType}
                reportID={reportID}
                draftTransactionIDs={draftTransactionIDs}
            />
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
            <OdometerReceiptStitcher
                isOdometerDistanceRequest={isOdometerDistanceRequest}
                currentTransactionID={currentTransactionID}
                odometerStartImage={odometerStartImage}
                odometerEndImage={odometerEndImage}
                action={action}
                iouType={iouType}
                onStitchingChange={setIsStitchingReceipt}
                onStitchError={setStitchError}
            />
            <ReceiptFileValidator
                transactions={transactions}
                requestType={requestType}
                iouType={iouType}
                initialTransactionID={initialTransactionID}
                reportID={reportID}
                action={action}
                report={report}
                participants={participants}
                draftTransactionIDs={draftTransactionIDs}
                onReceiptFilesChange={setReceiptFiles}
            />
            <DragAndDropProvider isDisabled={!showReceiptEmptyState || isOdometerDistanceRequest}>
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        subtitle={hasMultipleTransactions ? `${currentTransactionIndex + 1} ${translate('common.of')} ${transactions.length}` : undefined}
                        onBackButtonPress={navigateBack}
                    >
                        {hasMultipleTransactions ? (
                            <PrevNextButtons
                                isPrevButtonDisabled={currentTransactionIndex === 0}
                                isNextButtonDisabled={currentTransactionIndex === transactions.length - 1}
                                onNext={showNextTransaction}
                                onPrevious={showPreviousTransaction}
                            />
                        ) : null}
                    </HeaderWithBackButton>
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
                    {!!stitchError && <FormHelpMessage message={stitchError} />}
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
                    >
                        {({onConfirm, isConfirming}) => (
                            <MoneyRequestConfirmationList
                                transaction={transaction}
                                selectedParticipants={participants}
                                onToggleBillable={setBillable}
                                onConfirm={onConfirm}
                                onSendMoney={sendMoney}
                                showRemoveExpenseConfirmModal={() => {
                                    confirmRemoveCurrentTransaction();
                                }}
                                receiptPath={receiptPath}
                                receiptFilename={receiptFilename}
                                iouType={iouType}
                                reportID={reportID}
                                shouldDisplayReceipt={
                                    !isMovingTransactionFromTrackExpense && (!isDistanceRequest || isManualDistanceRequest || isOdometerDistanceRequest) && !isPerDiemRequest
                                }
                                isPolicyExpenseChat={isPolicyExpenseChat}
                                policyID={policyID}
                                isOdometerDistanceRequest={isOdometerDistanceRequest}
                                isLoadingReceipt={isStitchingReceipt}
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
                </View>
            </DragAndDropProvider>
        </ScreenWrapper>
    );
}

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmation);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationWithFullTransactionOrNotFound);
export default IOURequestStepConfirmationWithWritableReportOrNotFound;
