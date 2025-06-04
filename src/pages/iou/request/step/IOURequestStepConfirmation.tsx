import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import ConfirmModal from '@components/ConfirmModal';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZoneUI';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import LocationPermissionModal from '@components/LocationPermissionModal';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import {usePersonalDetails} from '@components/OnyxProvider';
import PDFThumbnail from '@components/PDFThumbnail';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import useFetchRoute from '@hooks/useFetchRoute';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import useThreeDotsAnchorPosition from '@hooks/useThreeDotsAnchorPosition';
import {completeTestDriveTask} from '@libs/actions/Task';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {isLocalFile as isLocalFileFileUtils, resizeImageIfNeeded, validateReceipt} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils, navigateToStartMoneyRequestStep, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import {generateReportID, getBankAccountRoute, getReportOrDraftReport, isProcessingReport, isReportOutstanding, isSelectedManagerMcTest} from '@libs/ReportUtils';
import {getDefaultTaxCode, getRateID, getRequestType, getValidWaypoints, isScanRequest} from '@libs/TransactionUtils';
import ReceiptDropUI from '@pages/iou/ReceiptDropUI';
import type {GpsPoint} from '@userActions/IOU';
import {
    checkIfScanFileCanBeRead,
    createDistanceRequest as createDistanceRequestIOUActions,
    getIOURequestPolicyID,
    requestMoney as requestMoneyIOUActions,
    sendInvoice,
    sendMoneyElsewhere,
    sendMoneyWithWallet,
    setMoneyRequestBillable,
    setMoneyRequestCategory,
    setMoneyRequestReceipt,
    splitBill,
    splitBillAndOpenReport,
    startMoneyRequest,
    startSplitBill,
    submitPerDiemExpense as submitPerDiemExpenseIOUActions,
    trackExpense as trackExpenseIOUActions,
    updateLastLocationPermissionPrompt,
} from '@userActions/IOU';
import {openDraftWorkspaceRequest} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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
        params: {iouType, reportID, transactionID: initialTransactionID, action, participantsAutoAssigned: participantsAutoAssignedFromRoute, backToReport},
    },
    transaction: initialTransaction,
    isLoadingTransaction,
}: IOURequestStepConfirmationProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();

    const [optimisticTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) => Object.values(items ?? {}),
        canBeMissing: true,
    });
    const transactions = useMemo(() => {
        const allTransactions = initialTransactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID ? (optimisticTransactions ?? []) : [initialTransaction];
        return allTransactions.filter((transaction): transaction is Transaction => !!transaction);
    }, [initialTransaction, initialTransactionID, optimisticTransactions]);
    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    const transactionIDs = useMemo(() => transactions?.map((transaction) => transaction.transactionID), [transactions.length]);
    // We will use setCurrentTransactionID later to switch between transactions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentTransactionID, setCurrentTransactionID] = useState<string>(initialTransactionID);
    const [existingTransaction, existingTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${currentTransactionID}`, {canBeMissing: true});
    const [optimisticTransaction, optimisticTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${currentTransactionID}`, {canBeMissing: true});
    const isLoadingCurrentTransaction = isLoadingOnyxValue(existingTransactionResult, optimisticTransactionResult);
    const transaction = useMemo(
        () => (!isLoadingCurrentTransaction ? (optimisticTransaction ?? existingTransaction) : undefined),
        [existingTransaction, optimisticTransaction, isLoadingCurrentTransaction],
    );
    const transactionsCategories = useDeepCompareRef(transactions.map(({transactionID, category}) => ({transactionID, category})));

    const realPolicyID = getIOURequestPolicyID(initialTransaction, reportReal);
    const draftPolicyID = getIOURequestPolicyID(initialTransaction, reportDraft);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${draftPolicyID}`, {canBeMissing: true});
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${realPolicyID}`, {canBeMissing: true});
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${realPolicyID}`, {canBeMissing: true});
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${draftPolicyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${realPolicyID}`, {canBeMissing: true});
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION, {canBeMissing: true});

    /*
     * We want to use a report from the transaction if it exists
     * Also if the report was submitted and delayed submission is on, then we should use an initial report
     */
    const transactionReport = getReportOrDraftReport(transaction?.reportID);
    const shouldUseTransactionReport =
        transactionReport && !(isProcessingReport(transactionReport) && !policyReal?.harvesting?.enabled) && isReportOutstanding(transactionReport, policyReal?.id);
    const report = shouldUseTransactionReport ? transactionReport : (reportReal ?? reportDraft);
    const policy = policyReal ?? policyDraft;
    const isDraftPolicy = policy === policyDraft;
    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const threeDotsAnchorPosition = useThreeDotsAnchorPosition(styles.threeDotsPopoverOffsetNoCloseButton);
    const {isOffline} = useNetwork();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [selectedParticipantList, setSelectedParticipantList] = useState<Participant[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths>();
    const [attachmentInvalidReason, setAttachmentValidReason] = useState<TranslationPaths>();
    const [pdfFile, setPdfFile] = useState<null | FileObject>(null);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

    const [receiptFiles, setReceiptFiles] = useState<Record<string, Receipt | undefined>>({});
    const requestType = getRequestType(transaction);
    const isDistanceRequest = requestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    const isPerDiemRequest = requestType === CONST.IOU.REQUEST_TYPE.PER_DIEM;
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {canBeMissing: true});

    const receiptFilename = transaction?.filename;
    const receiptPath = transaction?.receipt?.source;
    const customUnitRateID = getRateID(transaction) ?? '';
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const isSharingTrackExpense = action === CONST.IOU.ACTION.SHARE;
    const isCategorizingTrackExpense = action === CONST.IOU.ACTION.CATEGORIZE;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const isTestTransaction = transaction?.participants?.some((participant) => isSelectedManagerMcTest(participant.login));
    const payeePersonalDetails = useMemo(() => {
        if (personalDetails?.[transaction?.splitPayerAccountIDs?.at(0) ?? -1]) {
            return personalDetails?.[transaction?.splitPayerAccountIDs?.at(0) ?? -1];
        }

        const participant = transaction?.participants?.find((val) => val.accountID === (transaction?.splitPayerAccountIDs?.at(0) ?? -1));

        return {
            login: participant?.login ?? '',
            accountID: participant?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            avatar: Expensicons.FallbackAvatar,
            displayName: participant?.login ?? '',
            isOptimisticPersonalDetail: true,
        };
    }, [personalDetails, transaction?.participants, transaction?.splitPayerAccountIDs]);

    const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).length && !isTestTransaction;
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // TODO: remove beta check after the feature is enabled
    const {isBetaEnabled} = usePermissions();

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

    const participants = useMemo(
        () =>
            transaction?.participants?.map((participant) => {
                if (participant.isSender && iouType === CONST.IOU.TYPE.INVOICE) {
                    return participant;
                }
                return participant.accountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant);
            }) ?? [],
        [transaction?.participants, personalDetails, iouType],
    );
    const isPolicyExpenseChat = useMemo(() => participants?.some((participant) => participant.isPolicyExpenseChat), [participants]);
    const formHasBeenSubmitted = useRef(false);

    const confirmModalPrompt = useMemo(() => {
        if (!attachmentInvalidReason) {
            return '';
        }
        if (attachmentInvalidReason === 'attachmentPicker.sizeExceededWithLimit') {
            return translate(attachmentInvalidReason, {maxUploadSizeInMB: CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE / (1024 * 1024)});
        }
        return translate(attachmentInvalidReason);
    }, [attachmentInvalidReason, translate]);

    useFetchRoute(transaction, transaction?.comment?.waypoints, action, shouldUseTransactionDraft(action) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT);

    useEffect(() => {
        Performance.markEnd(CONST.TIMING.OPEN_CREATE_EXPENSE_APPROVE);
    }, []);
    useEffect(() => {
        const policyExpenseChat = participants?.find((participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat?.policyID && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
        const senderPolicyParticipant = participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender);
        if (senderPolicyParticipant?.policyID && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            openDraftWorkspaceRequest(senderPolicyParticipant.policyID);
        }
    }, [isOffline, participants, policy?.pendingAction]);

    const defaultBillable = !!policy?.defaultBillable;
    useEffect(() => {
        transactionIDs.forEach((transactionID) => {
            setMoneyRequestBillable(transactionID, defaultBillable);
        });
    }, [transactionIDs, defaultBillable]);

    useEffect(() => {
        // Exit early if the transaction is still loading
        if (isLoadingTransaction) {
            return;
        }

        // Check if the transaction belongs to the current report
        const isCurrentReportID = transaction?.isFromGlobalCreate
            ? transaction?.participants?.at(0)?.reportID === reportID || (!transaction?.participants?.at(0)?.reportID && transaction?.reportID === reportID)
            : transaction?.reportID === reportID;

        // Exit if the transaction already exists and is associated with the current report
        if (
            transaction?.transactionID &&
            (!transaction?.isFromGlobalCreate || !isEmptyObject(transaction?.participants)) &&
            (isCurrentReportID || isMovingTransactionFromTrackExpense || iouType === CONST.IOU.TYPE.INVOICE)
        ) {
            return;
        }

        startMoneyRequest(
            CONST.IOU.TYPE.CREATE,
            // When starting to create an expense from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
            // for all of the routes in the creation flow.
            generateReportID(),
        );
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, [isLoadingTransaction, isMovingTransactionFromTrackExpense]);

    useEffect(() => {
        transactions.forEach((item) => {
            if (!item.category) {
                return;
            }
            if (policyCategories?.[item.category] && !policyCategories[item.category].enabled) {
                setMoneyRequestCategory(item.transactionID, '', policy?.id);
            }
        });
        // We don't want to clear out category every time the transactions change
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [policy?.id, policyCategories, transactionsCategories]);

    const policyDistance = Object.values(policy?.customUnits ?? {}).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const defaultCategory = policyDistance?.defaultCategory ?? '';

    useEffect(() => {
        transactions.forEach((item) => {
            if (requestType !== CONST.IOU.REQUEST_TYPE.DISTANCE || !!item?.category) {
                return;
            }
            setMoneyRequestCategory(item.transactionID, defaultCategory, policy?.id);
        });
        // Prevent resetting to default when unselect category
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [transactionIDs, requestType, defaultCategory, policy?.id]);

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     */
    const setUploadReceiptError = (isInvalid: boolean, title: TranslationPaths, reason: TranslationPaths) => {
        setIsAttachmentInvalid(isInvalid);
        setAttachmentInvalidReasonTitle(title);
        setAttachmentValidReason(reason);
        setPdfFile(null);
    };

    const hideReceiptModal = () => {
        setIsAttachmentInvalid(false);
    };

    /**
     * Sets the Receipt object when dragging and dropping a file
     */
    const setReceiptOnDrop = (originalFile: FileObject, isPdfValidated?: boolean) => {
        validateReceipt(originalFile, setUploadReceiptError).then((isFileValid) => {
            if (!isFileValid) {
                return;
            }

            // If we have a pdf file and if it is not validated then set the pdf file for validation and return
            if (Str.isPDF(originalFile.name ?? '') && !isPdfValidated) {
                setPdfFile(originalFile);
                setIsLoadingReceipt(true);
                return;
            }

            // With the image size > 24MB, we use manipulateAsync to resize the image.
            // It takes a long time so we should display a loading indicator while the resize image progresses.
            if (Str.isImage(originalFile.name ?? '') && (originalFile?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setIsLoadingReceipt(true);
            }
            resizeImageIfNeeded(originalFile).then((file) => {
                setIsLoadingReceipt(false);
                // Store the receipt on the transaction object in Onyx
                const source = URL.createObjectURL(file as Blob);
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                setMoneyRequestReceipt(currentTransactionID, source, file.name || '', true);
            });
        });
    };

    const navigateBack = useCallback(() => {
        // If the action is categorize and there's no policies other than personal one, we simply call goBack(), i.e: dismiss the whole flow together
        // We don't need to subscribe to policy_ collection as we only need to check on the latest collection value
        if (action === CONST.IOU.ACTION.CATEGORIZE) {
            Navigation.goBack();
            return;
        }
        if (isPerDiemRequest) {
            if (isMovingTransactionFromTrackExpense) {
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
        navigateToStartMoneyRequestStep(requestType, iouType, initialTransactionID, reportID, action);
    }, [
        action,
        isPerDiemRequest,
        transaction?.isFromGlobalCreate,
        transaction?.receipt?.isTestReceipt,
        transaction?.receipt?.isTestDriveReceipt,
        transaction?.participantsAutoAssigned,
        transaction?.reportID,
        transaction?.participants,
        requestType,
        iouType,
        initialTransactionID,
        reportID,
        participantsAutoAssignedFromRoute,
        isMovingTransactionFromTrackExpense,
    ]);

    const navigateToAddReceipt = useCallback(() => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(action, iouType, initialTransactionID, reportID, Navigation.getActiveRouteWithoutParams()));
    }, [iouType, initialTransactionID, reportID, action]);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {
        let newReceiptFiles = {};
        let isScanFilesCanBeRead = true;

        Promise.all(
            transactions.map((item) => {
                const itemReceiptFilename = item.filename;
                const itemReceiptPath = item.receipt?.source;
                const itemReceiptType = item.receipt?.type;
                const isLocalFile = isLocalFileFileUtils(itemReceiptPath);

                if (!isLocalFile) {
                    newReceiptFiles = {...newReceiptFiles, [item.transactionID]: item.receipt};
                    return;
                }

                const onSuccess = (file: File) => {
                    const receipt: Receipt = file;
                    if (item?.receipt?.isTestReceipt) {
                        receipt.isTestReceipt = true;
                        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE;
                    } else if (item?.receipt?.isTestDriveReceipt) {
                        receipt.isTestDriveReceipt = true;
                        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE;
                    } else {
                        receipt.state = file && requestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCAN_READY;
                    }

                    newReceiptFiles = {...newReceiptFiles, [item.transactionID]: receipt};
                };

                const onFailure = () => {
                    isScanFilesCanBeRead = false;
                    setMoneyRequestReceipt(item.transactionID, '', '', true);
                };

                return checkIfScanFileCanBeRead(itemReceiptFilename, itemReceiptPath, itemReceiptType, onSuccess, onFailure);
            }),
        ).then(() => {
            if (isScanFilesCanBeRead) {
                setReceiptFiles(newReceiptFiles);
                return;
            }
            if (requestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, initialTransactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                return;
            }
            navigateToStartMoneyRequestStep(requestType, iouType, initialTransactionID, reportID);
        });
    }, [requestType, iouType, initialTransactionID, reportID, action, report, transactions, participants]);

    const requestMoney = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string, gpsPoints?: GpsPoint) => {
            if (!transactions.length) {
                return;
            }

            const participant = selectedParticipants.at(0);
            if (!participant) {
                return;
            }

            transactions.forEach((item, index) => {
                const receipt = receiptFiles[item.transactionID];
                const isTestReceipt = receipt?.isTestReceipt ?? false;
                const isTestDriveReceipt = receipt?.isTestDriveReceipt ?? false;

                if (isTestDriveReceipt) {
                    completeTestDriveTask();
                }

                requestMoneyIOUActions({
                    report,
                    participantParams: {
                        payeeEmail: currentUserPersonalDetails.login,
                        payeeAccountID: currentUserPersonalDetails.accountID,
                        participant,
                    },
                    policyParams: {
                        policy,
                        policyTagList: policyTags,
                        policyCategories,
                    },
                    gpsPoints,
                    action,
                    transactionParams: {
                        amount: isTestReceipt ? CONST.TEST_RECEIPT.AMOUNT : item.amount,
                        attendees: item.comment?.attendees,
                        currency: isTestReceipt ? CONST.TEST_RECEIPT.CURRENCY : item.currency,
                        created: item.created,
                        merchant: isTestReceipt ? CONST.TEST_RECEIPT.MERCHANT : item.merchant,
                        comment: trimmedComment,
                        receipt,
                        category: item.category,
                        tag: item.tag,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        billable: item.billable,
                        actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                        waypoints: Object.keys(item.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true) : undefined,
                        customUnitRateID,
                        isTestDrive: item.receipt?.isTestDriveReceipt,
                    },
                    shouldHandleNavigation: index === transactions.length - 1,
                    backToReport,
                });
            });
        },
        [
            report,
            transactions,
            receiptFiles,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            policy,
            policyTags,
            policyCategories,
            action,
            transactionTaxCode,
            transactionTaxAmount,
            customUnitRateID,
            backToReport,
        ],
    );

    const submitPerDiemExpense = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string) => {
            if (!transaction) {
                return;
            }

            const participant = selectedParticipants.at(0);
            if (!participant || isEmptyObject(transaction.comment) || isEmptyObject(transaction.comment.customUnit)) {
                return;
            }
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
                    policyCategories,
                },
                transactionParams: {
                    currency: transaction.currency,
                    created: transaction.created,
                    comment: trimmedComment,
                    category: transaction.category,
                    tag: transaction.tag,
                    customUnit: transaction.comment?.customUnit,
                    billable: transaction.billable,
                    attendees: transaction.comment?.attendees,
                },
            });
        },
        [report, transaction, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, policy, policyTags, policyCategories],
    );

    const trackExpense = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string, gpsPoints?: GpsPoint) => {
            if (!report || !transactions.length) {
                return;
            }
            const participant = selectedParticipants.at(0);
            if (!participant) {
                return;
            }
            transactions.forEach((item, index) => {
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
                        currency: item.currency,
                        created: item.created,
                        merchant: item.merchant,
                        comment: trimmedComment,
                        receipt: receiptFiles[item.transactionID],
                        category: item.category,
                        tag: item.tag,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        billable: item.billable,
                        gpsPoints,
                        validWaypoints: Object.keys(item?.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true) : undefined,
                        actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                        customUnitRateID,
                        attendees: item.comment?.attendees,
                    },
                    accountantParams: {
                        accountant: item.accountant,
                    },
                    shouldHandleNavigation: index === transactions.length - 1,
                });
            });
        },
        [
            report,
            transactions,
            receiptFiles,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            transactionTaxCode,
            transactionTaxAmount,
            policy,
            policyTags,
            policyCategories,
            action,
            customUnitRateID,
            isDraftPolicy,
        ],
    );

    const createDistanceRequest = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string) => {
            if (!transaction) {
                return;
            }
            createDistanceRequestIOUActions({
                report,
                participants: selectedParticipants,
                currentUserLogin: currentUserPersonalDetails.login,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                iouType,
                existingTransaction: transaction,
                policyParams: {
                    policy,
                    policyCategories,
                    policyTagList: policyTags,
                },
                transactionParams: {
                    amount: transaction.amount,
                    comment: trimmedComment,
                    created: transaction.created,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    category: transaction.category,
                    tag: transaction.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    customUnitRateID,
                    splitShares: transaction.splitShares,
                    validWaypoints: getValidWaypoints(transaction.comment?.waypoints, true),
                    billable: transaction.billable,
                    attendees: transaction.comment?.attendees,
                },
                backToReport,
            });
        },
        [
            transaction,
            report,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            iouType,
            policy,
            policyCategories,
            policyTags,
            transactionTaxCode,
            transactionTaxAmount,
            customUnitRateID,
            backToReport,
        ],
    );

    const createTransaction = useCallback(
        (selectedParticipants: Participant[], locationPermissionGranted = false) => {
            setIsConfirmed(true);
            let splitParticipants = selectedParticipants;

            // Filter out participants with an amount equal to O
            if (iouType === CONST.IOU.TYPE.SPLIT && transaction?.splitShares) {
                const participantsWithAmount = Object.keys(transaction.splitShares ?? {})
                    .filter((accountID: string): boolean => (transaction?.splitShares?.[Number(accountID)]?.amount ?? 0) > 0)
                    .map((accountID) => Number(accountID));
                splitParticipants = selectedParticipants.filter((participant) =>
                    participantsWithAmount.includes(
                        participant.isPolicyExpenseChat ? (participant?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) : (participant.accountID ?? CONST.DEFAULT_NUMBER_ID),
                    ),
                );
            }
            const trimmedComment = transaction?.comment?.comment?.trim() ?? '';

            // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
            if (formHasBeenSubmitted.current) {
                return;
            }

            formHasBeenSubmitted.current = true;

            if (iouType !== CONST.IOU.TYPE.TRACK && isDistanceRequest && !isMovingTransactionFromTrackExpense) {
                createDistanceRequest(iouType === CONST.IOU.TYPE.SPLIT ? splitParticipants : selectedParticipants, trimmedComment);
                return;
            }

            const currentTransactionReceiptFile = transaction?.transactionID ? receiptFiles[transaction.transactionID] : undefined;

            // If we have a receipt let's start the split expense by creating only the action, the transaction, and the group DM if needed
            if (iouType === CONST.IOU.TYPE.SPLIT && currentTransactionReceiptFile) {
                if (currentUserPersonalDetails.login && !!transaction) {
                    startSplitBill({
                        participants: selectedParticipants,
                        currentUserLogin: currentUserPersonalDetails.login,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        comment: trimmedComment,
                        receipt: currentTransactionReceiptFile,
                        existingSplitChatReportID: report?.reportID,
                        billable: transaction.billable,
                        category: transaction.category,
                        tag: transaction.tag,
                        currency: transaction.currency,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                    });
                }
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
                        iouRequestType: transaction.iouRequestType,
                        splitShares: transaction.splitShares,
                        splitPayerAccountIDs: transaction.splitPayerAccountIDs ?? [],
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                    });
                }
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
                        iouRequestType: transaction.iouRequestType,
                        splitShares: transaction.splitShares,
                        splitPayerAccountIDs: transaction.splitPayerAccountIDs,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                    });
                }
                return;
            }

            if (iouType === CONST.IOU.TYPE.INVOICE) {
                sendInvoice(currentUserPersonalDetails.accountID, transaction, report, currentTransactionReceiptFile, policy, policyTags, policyCategories);
                return;
            }

            if (iouType === CONST.IOU.TYPE.TRACK || isCategorizingTrackExpense || isSharingTrackExpense) {
                if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && transaction) {
                    // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                    if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                        if (userLocation) {
                            trackExpense(selectedParticipants, trimmedComment, {
                                lat: userLocation.latitude,
                                long: userLocation.longitude,
                            });
                            return;
                        }

                        getCurrentPosition(
                            (successData) => {
                                trackExpense(selectedParticipants, trimmedComment, {
                                    lat: successData.coords.latitude,
                                    long: successData.coords.longitude,
                                });
                            },
                            (errorData) => {
                                Log.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                                // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                                trackExpense(selectedParticipants, trimmedComment);
                            },
                            {
                                maximumAge: CONST.GPS.MAX_AGE,
                                timeout: CONST.GPS.TIMEOUT,
                            },
                        );
                        return;
                    }

                    // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                    trackExpense(selectedParticipants, trimmedComment);
                    return;
                }
                trackExpense(selectedParticipants, trimmedComment);
                return;
            }

            if (isPerDiemRequest) {
                submitPerDiemExpense(selectedParticipants, trimmedComment);
                return;
            }

            if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && !!transaction) {
                // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                if (
                    transaction.amount === 0 &&
                    !isSharingTrackExpense &&
                    !isCategorizingTrackExpense &&
                    locationPermissionGranted &&
                    !selectedParticipants.some((participant) => isSelectedManagerMcTest(participant.login))
                ) {
                    if (userLocation) {
                        requestMoney(selectedParticipants, trimmedComment, {
                            lat: userLocation.latitude,
                            long: userLocation.longitude,
                        });
                        return;
                    }

                    getCurrentPosition(
                        (successData) => {
                            requestMoney(selectedParticipants, trimmedComment, {
                                lat: successData.coords.latitude,
                                long: successData.coords.longitude,
                            });
                        },
                        (errorData) => {
                            Log.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                            // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                            requestMoney(selectedParticipants, trimmedComment);
                        },
                        {
                            maximumAge: CONST.GPS.MAX_AGE,
                            timeout: CONST.GPS.TIMEOUT,
                        },
                    );
                    return;
                }

                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                requestMoney(selectedParticipants, trimmedComment);
                return;
            }

            requestMoney(selectedParticipants, trimmedComment);
        },
        [
            iouType,
            transaction,
            isDistanceRequest,
            isMovingTransactionFromTrackExpense,
            receiptFiles,
            isCategorizingTrackExpense,
            isSharingTrackExpense,
            isPerDiemRequest,
            requestMoney,
            createDistanceRequest,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            report,
            transactionTaxCode,
            transactionTaxAmount,
            policy,
            policyTags,
            policyCategories,
            trackExpense,
            submitPerDiemExpense,
            userLocation,
        ],
    );

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     */
    const sendMoney = useCallback(
        (paymentMethod: PaymentMethodType | undefined) => {
            const currency = transaction?.currency;
            const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
            const participant = participants?.at(0);

            if (!participant || !transaction?.amount || !currency) {
                return;
            }

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                setIsConfirmed(true);
                sendMoneyElsewhere(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
                return;
            }

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                setIsConfirmed(true);
                sendMoneyWithWallet(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
            }
        },
        [transaction?.amount, transaction?.comment, transaction?.currency, participants, currentUserPersonalDetails.accountID, report],
    );

    const setBillable = useCallback(
        (billable: boolean) => {
            setMoneyRequestBillable(currentTransactionID, billable);
        },
        [currentTransactionID],
    );

    // This loading indicator is shown because the transaction originalCurrency is being updated later than the component mounts.
    // To prevent the component from rendering with the wrong currency, we show a loading indicator until the correct currency is set.
    const isLoading = !!transaction?.originalCurrency;

    const onConfirm = (listOfParticipants: Participant[]) => {
        setIsConfirming(true);
        setSelectedParticipantList(listOfParticipants);

        if (gpsRequired) {
            const shouldStartLocationPermissionFlow =
                !lastLocationPermissionPrompt ||
                (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
                    DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS);

            if (shouldStartLocationPermissionFlow) {
                setStartLocationPermissionFlow(true);
                return;
            }
        }

        createTransaction(listOfParticipants);
        setIsConfirming(false);
    };

    if (isLoadingTransaction) {
        return <FullScreenLoadingIndicator />;
    }

    const PDFThumbnailView = pdfFile ? (
        <PDFThumbnail
            style={styles.invisiblePDF}
            previewSourceURL={pdfFile.uri ?? ''}
            onLoadSuccess={() => {
                setPdfFile(null);
                setIsLoadingReceipt(false);
                setReceiptOnDrop(pdfFile, true);
            }}
            onPassword={() => {
                setIsLoadingReceipt(false);
                setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.protectedPDFNotSupported');
            }}
            onLoadError={() => {
                setIsLoadingReceipt(false);
                setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.errorWhileSelectingCorruptedAttachment');
            }}
        />
    ) : null;

    const shouldShowThreeDotsButton =
        requestType === CONST.IOU.REQUEST_TYPE.MANUAL && (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK) && !isMovingTransactionFromTrackExpense;

    const shouldShowSmartScanFields =
        !!transaction?.receipt?.isTestDriveReceipt || (isMovingTransactionFromTrackExpense ? transaction?.amount !== 0 : requestType !== CONST.IOU.REQUEST_TYPE.SCAN);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight={canUseTouchScreen()}
            testID={IOURequestStepConfirmation.displayName}
            headerGapStyles={isDraggingOver ? [isBetaEnabled(CONST.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? styles.dropWrapper : styles.isDraggingOver] : []}
        >
            <DragAndDropProvider
                setIsDraggingOver={setIsDraggingOver}
                isDisabled={!shouldShowThreeDotsButton}
            >
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={navigateBack}
                        shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                        threeDotsAnchorPosition={threeDotsAnchorPosition}
                        threeDotsMenuItems={[
                            {
                                icon: Expensicons.Receipt,
                                text: translate('receipt.addReceipt'),
                                onSelected: navigateToAddReceipt,
                            },
                        ]}
                    />
                    {(isLoading || isLoadingReceipt || (isScanRequest(transaction) && !Object.values(receiptFiles).length)) && <FullScreenLoadingIndicator />}
                    {PDFThumbnailView}
                    {/* TODO: remove beta check after the feature is enabled */}
                    {isBetaEnabled(CONST.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? (
                        <DropZoneUI
                            onDrop={(e) => {
                                const file = e?.dataTransfer?.files[0];
                                if (file) {
                                    file.uri = URL.createObjectURL(file);
                                    setReceiptOnDrop(file);
                                }
                            }}
                            icon={Expensicons.ReplaceReceipt}
                            dropStyles={styles.receiptDropOverlay}
                            dropTitle={translate('dropzone.replaceReceipt')}
                            dropTextStyles={styles.receiptDropText}
                            dropInnerWrapperStyles={styles.receiptDropInnerWrapper}
                        />
                    ) : (
                        <ReceiptDropUI
                            onDrop={(e) => {
                                const file = e?.dataTransfer?.files[0];
                                if (file) {
                                    file.uri = URL.createObjectURL(file);
                                    setReceiptOnDrop(file);
                                }
                            }}
                        />
                    )}
                    <ConfirmModal
                        title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                        onConfirm={hideReceiptModal}
                        onCancel={hideReceiptModal}
                        isVisible={isAttachmentInvalid}
                        prompt={confirmModalPrompt}
                        confirmText={translate('common.close')}
                        shouldShowCancelButton={false}
                    />
                    {!!gpsRequired && (
                        <LocationPermissionModal
                            startPermissionFlow={startLocationPermissionFlow}
                            resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                            onGrant={() => {
                                navigateAfterInteraction(() => {
                                    createTransaction(selectedParticipantList, true);
                                });
                            }}
                            onDeny={() => {
                                updateLastLocationPermissionPrompt();
                                navigateAfterInteraction(() => {
                                    createTransaction(selectedParticipantList, false);
                                });
                            }}
                            onInitialGetLocationCompleted={() => {
                                setIsConfirming(false);
                            }}
                        />
                    )}
                    <MoneyRequestConfirmationList
                        transaction={transaction}
                        selectedParticipants={participants}
                        iouAmount={Math.abs(transaction?.amount ?? 0)}
                        iouAttendees={transaction?.comment?.attendees ?? []}
                        iouComment={transaction?.comment?.comment ?? ''}
                        iouCurrencyCode={transaction?.currency}
                        iouIsBillable={transaction?.billable}
                        onToggleBillable={setBillable}
                        iouCategory={transaction?.category}
                        onConfirm={onConfirm}
                        onSendMoney={sendMoney}
                        receiptPath={receiptPath}
                        receiptFilename={receiptFilename}
                        iouType={iouType}
                        reportID={reportID}
                        shouldDisplayReceipt={!isMovingTransactionFromTrackExpense && !isDistanceRequest && !isPerDiemRequest}
                        isPolicyExpenseChat={isPolicyExpenseChat}
                        policyID={getIOURequestPolicyID(transaction, report)}
                        bankAccountRoute={getBankAccountRoute(report)}
                        iouMerchant={transaction?.merchant}
                        iouCreated={transaction?.created}
                        isDistanceRequest={isDistanceRequest}
                        isPerDiemRequest={isPerDiemRequest}
                        shouldShowSmartScanFields={shouldShowSmartScanFields}
                        action={action}
                        payeePersonalDetails={payeePersonalDetails}
                        isConfirmed={isConfirmed}
                        isConfirming={isConfirming}
                        isReceiptEditable
                    />
                </View>
            </DragAndDropProvider>
        </ScreenWrapper>
    );
}

IOURequestStepConfirmation.displayName = 'IOURequestStepConfirmation';

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmation);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationWithFullTransactionOrNotFound);
export default IOURequestStepConfirmationWithWritableReportOrNotFound;
