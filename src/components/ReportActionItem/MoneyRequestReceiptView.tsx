import {hasSeenTourSelector} from '@selectors/Onboarding';
import mapValues from 'lodash/mapValues';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AttachmentPicker from '@components/AttachmentPicker';
import Icon from '@components/Icon';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import ReceiptAudit, {ReceiptAuditMessages} from '@components/ReceiptAudit';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import Tooltip from '@components/Tooltip';
import useActiveRoute from '@hooks/useActiveRoute';
import useAncestors from '@hooks/useAncestors';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useFilesValidation from '@hooks/useFilesValidation';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {getBrokenConnectionUrlToFixPersonalCard} from '@libs/CardUtils';
import {hasHoverSupport} from '@libs/DeviceCapabilities';
import {getMicroSecondOnyxErrorWithTranslationKey, isReceiptError} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isMarkAsCashActionForTransaction} from '@libs/ReportPrimaryActionUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getCreationReportErrors,
    isInvoiceReport,
    isPaidGroupPolicy,
    isTrackExpenseReportNew,
} from '@libs/ReportUtils';
import trackExpenseCreationError from '@libs/telemetry/trackExpenseCreationError';
import {
    didReceiptScanSucceed as didReceiptScanSucceedTransactionUtils,
    hasReceipt as hasReceiptTransactionUtils,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest,
    isScanning,
} from '@libs/TransactionUtils';
import ViolationsUtils, {filterReceiptViolations} from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import {clearAllRelatedReportActionErrors} from '@userActions/ClearReportActionErrors';
import {cleanUpMoneyRequest} from '@userActions/IOU/DeleteMoneyRequest';
import {replaceReceipt} from '@userActions/IOU/Receipt';
import {addAttachmentWithComment, navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import {clearError, getLastModifiedExpense, revert} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionPendingFieldsKey} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {isElementHovered, resetButtonHoverState} from './receiptHoverUtils';
import ReportActionItemImage from './ReportActionItemImage';

type MoneyRequestReceiptViewProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Whether we should show Money Request with disabled all fields */
    readonly?: boolean;

    /** Updated transaction to show in duplicate & merge transaction flow  */
    updatedTransaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Merge transaction ID to show in merge transaction flow */
    mergeTransactionID?: string;

    /** Whether the receipt view should fill the given space */
    fillSpace?: boolean;

    /** Whether it's displayed in Wide RHP */
    isDisplayedInWideRHP?: boolean;

    /** Whether the parent component has a pending action */
    hasParentPendingAction?: boolean;
};

const receiptImageViolationNames = new Set<OnyxTypes.ViolationName>([
    CONST.VIOLATIONS.RECEIPT_REQUIRED,
    CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED,
    CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
    CONST.VIOLATIONS.CASH_EXPENSE_WITH_NO_RECEIPT,
    CONST.VIOLATIONS.SMARTSCAN_FAILED,
    CONST.VIOLATIONS.PROHIBITED_EXPENSE,
    CONST.VIOLATIONS.RECEIPT_GENERATED_WITH_AI,
]);

const receiptFieldViolationNames = new Set<OnyxTypes.ViolationName>([CONST.VIOLATIONS.MODIFIED_AMOUNT, CONST.VIOLATIONS.MODIFIED_DATE]);

function MoneyRequestReceiptView({
    report,
    readonly = false,
    updatedTransaction,
    fillSpace = false,
    mergeTransactionID,
    isDisplayedInWideRHP = false,
    hasParentPendingAction = false,
}: MoneyRequestReceiptViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {getReportRHPActiveRoute} = useActiveRoute();
    const parentReportID = report?.parentReportID;
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(parentReportID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(parentReport?.parentReportID)}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        canEvict: false,
    });
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const [isLoading, setIsLoading] = useState(true);
    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const originalReportID = useOriginalReportID(report?.reportID, parentReportAction);
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(parentReportAction);
    const isTrackExpense = !mergeTransactionID && isTrackExpenseReportNew(report, parentReport, parentReportAction);
    const moneyRequestReport = parentReport;
    const linkedTransactionID = useMemo(() => {
        if (!parentReportAction) {
            return undefined;
        }
        const originalMessage = parentReportAction && isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction) : undefined;
        return originalMessage?.IOUTransactionID;
    }, [parentReportAction]);

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(linkedTransactionID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${moneyRequestReport?.policyID}`);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${moneyRequestReport?.policyID}`);

    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const hasReceipt = hasReceiptTransactionUtils(updatedTransaction ?? transaction);
    const isTransactionScanning = isScanning(updatedTransaction ?? transaction);
    const didReceiptScanSucceed = hasReceipt && didReceiptScanSucceedTransactionUtils(transaction);
    const isInvoice = isInvoiceReport(moneyRequestReport);
    const isChatReportArchived = useReportIsArchived(moneyRequestReport?.chatReportID);
    const {login: currentUserLogin, accountID: currentUserAccountID, timezone: currentUserTimezone} = useCurrentUserPersonalDetails();
    const theme = useTheme();
    const ancestors = useAncestors(report);
    const {hovered, bind: hoverBind} = useHover();
    const {isOffline} = useNetwork();
    const receiptContainerRef = useRef<View | null>(null);
    const addButtonRef = useRef<View | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const deviceHasHoverSupport = hasHoverSupport();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Expand', 'ReceiptPlus']);

    // Browsers don't fire mouseenter when an element mounts under the cursor
    useEffect(() => {
        if (isLoading) {
            return;
        }
        if (isElementHovered(receiptContainerRef)) {
            hoverBind.onMouseEnter();
        }
    }, [isLoading, hoverBind]);

    const prevSource = usePrevious(transaction?.receipt?.source);

    useEffect(() => {
        if (!transaction?.receipt?.source || prevSource === transaction?.receipt?.source) {
            return;
        }
        setIsLoading(true);
    }, [transaction?.receipt?.source, prevSource]);

    // Flags for allowing or disallowing editing an expense
    // Used for non-restricted fields such as: description, category, tag, billable, etc...
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isEditable = !!canUserPerformWriteActionReportUtils(report, isReportArchived) && !readonly;
    const canEdit = isMoneyRequestAction(parentReportAction) && canEditMoneyRequest(parentReportAction, transaction, isChatReportArchived, moneyRequestReport, policy) && isEditable;
    const companyCardPageURL = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(report?.policyID)}`;
    const {personalCardsWithBrokenConnection} = useCardFeedErrors();
    const connectionLink = getBrokenConnectionUrlToFixPersonalCard(personalCardsWithBrokenConnection, environmentURL);

    const canEditReceipt =
        isEditable &&
        canEditFieldOfMoneyRequest({reportAction: parentReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, isChatReportArchived, transaction, report: moneyRequestReport, policy});

    const onAttachmentFilesValidated = (files: FileObject[]) => {
        if (!report?.reportID) {
            return;
        }
        const notifyReportID = moneyRequestReport?.reportID ? [report.reportID, moneyRequestReport.reportID] : report.reportID;
        addAttachmentWithComment({
            report,
            notifyReportID,
            ancestors,
            attachments: files,
            currentUserAccountID,
            timezone: currentUserTimezone,
        });
    };

    const {validateFiles, PDFValidationComponent, ErrorModal: AttachmentErrorModal} = useFilesValidation(onAttachmentFilesValidated);

    const iouType = useMemo(() => {
        if (isTrackExpense) {
            return CONST.IOU.TYPE.TRACK;
        }
        if (isInvoice) {
            return CONST.IOU.TYPE.INVOICE;
        }

        return CONST.IOU.TYPE.SUBMIT;
    }, [isTrackExpense, isInvoice]);

    let receiptURIs;
    if (hasReceipt) {
        receiptURIs = getThumbnailAndImageURIs(updatedTransaction ?? transaction);
    }
    const pendingAction = transaction?.pendingAction;
    // Need to return undefined when we have pendingAction to avoid the duplicate pending action
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => {
        if (hasParentPendingAction) {
            return undefined;
        }
        if (isDisplayedInWideRHP) {
            return transaction?.pendingFields?.[fieldPath] ?? pendingAction;
        }

        return pendingAction ? undefined : transaction?.pendingFields?.[fieldPath];
    };

    const transactionToCheck = updatedTransaction ?? transaction;
    const doesTransactionHaveReceipt = !!transactionToCheck?.receipt && !isEmptyObject(transactionToCheck?.receipt);
    // Empty state for invoices should be displayed only in WideRHP
    const shouldShowReceiptEmptyState = (isDisplayedInWideRHP || !isInvoice) && !hasReceipt && !!transactionToCheck && !doesTransactionHaveReceipt;
    const isMarkAsCash = parentReport && currentUserLogin ? isMarkAsCashActionForTransaction(currentUserLogin, parentReport, transactionViolations, policy) : false;

    const routeDistanceMeters = transaction?.comment?.customUnit?.routeDistanceMeters;
    const distanceUnit = transaction?.comment?.customUnit?.distanceUnit;

    const [receiptImageViolations, receiptViolations] = useMemo(() => {
        const imageViolations = [];
        const allViolations = [];
        const filteredViolations = filterReceiptViolations(transactionViolations ?? []);

        for (const violation of filteredViolations) {
            const isReceiptFieldViolation = receiptFieldViolationNames.has(violation.name);
            const isReceiptImageViolation = receiptImageViolationNames.has(violation.name);
            const isRTERViolation = violation.name === CONST.VIOLATIONS.RTER;
            if (isReceiptFieldViolation || isReceiptImageViolation || isRTERViolation) {
                const cardID = violation.data?.cardID;
                const card = cardID ? cardList?.[cardID] : undefined;
                const violationMessage = ViolationsUtils.getViolationTranslation({
                    violation,
                    translate,
                    canEdit,
                    companyCardPageURL,
                    connectionLink,
                    card,
                    isMarkAsCash,
                    routeDistanceMeters,
                    distanceUnit,
                });
                allViolations.push(violationMessage);
                if (isReceiptImageViolation || isRTERViolation) {
                    imageViolations.push(violationMessage);
                }
            }
        }
        return [imageViolations, allViolations];
    }, [transactionViolations, translate, canEdit, companyCardPageURL, connectionLink, cardList, isMarkAsCash, routeDistanceMeters, distanceUnit]);

    const receiptRequiredViolation = transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.RECEIPT_REQUIRED);
    const itemizedReceiptRequiredViolation = transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
    const customRulesViolation = transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_RULES);

    // Whether to show receipt audit result (e.g.`Verified`, `Issue Found`) and messages (e.g. `Receipt not verified. Please confirm accuracy.`)
    // `!!(receiptViolations.length || didReceiptScanSucceed)` is for not showing `Verified` when `receiptViolations` is empty and `didReceiptScanSucceed` is false.
    const shouldShowAuditMessage =
        !isTransactionScanning &&
        (hasReceipt || !!receiptRequiredViolation || !!itemizedReceiptRequiredViolation || !!customRulesViolation) &&
        !!(receiptViolations.length || didReceiptScanSucceed) &&
        isPaidGroupPolicy(report);
    const shouldShowReceiptAudit = !isInvoice && (shouldShowReceiptEmptyState || hasReceipt);

    const errorsWithoutReportCreation = useMemo(
        () => ({
            ...(transaction?.errorFields?.route ?? transaction?.errorFields?.waypoints ?? transaction?.errors),
            ...parentReportAction?.errors,
        }),
        [transaction?.errorFields?.route, transaction?.errorFields?.waypoints, transaction?.errors, parentReportAction?.errors],
    );
    const reportCreationError = useMemo(() => (getCreationReportErrors(report) ? getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage') : {}), [report]);
    const errors = useMemo(() => ({...errorsWithoutReportCreation, ...reportCreationError}), [errorsWithoutReportCreation, reportCreationError]);
    const showReceiptErrorWithEmptyState = shouldShowReceiptEmptyState && !hasReceipt && !isEmptyObject(errors);

    const {showConfirmModal} = useConfirmModal();

    const transactionAndReportActionErrors = useMemo(
        () => ({
            ...transaction?.errors,
            ...parentReportAction?.errors,
        }),
        [transaction?.errors, parentReportAction?.errors],
    );

    const dismissReceiptError = () => {
        if (!report?.reportID) {
            return;
        }

        // Track expense creation errors to Sentry when the user dismisses them
        if (!isEmptyObject(errors)) {
            let errorType: ValueOf<typeof CONST.TELEMETRY.EXPENSE_ERROR_TYPE>;
            let errorSource: ValueOf<typeof CONST.TELEMETRY.EXPENSE_ERROR_SOURCE>;

            if (!isEmptyObject(reportCreationError)) {
                errorType = CONST.TELEMETRY.EXPENSE_ERROR_TYPE.REPORT_CREATION_FAILED;
                errorSource = CONST.TELEMETRY.EXPENSE_ERROR_SOURCE.REPORT_CREATION;
            } else if (parentReportAction?.errors && !isEmptyObject(parentReportAction.errors)) {
                errorType = CONST.TELEMETRY.EXPENSE_ERROR_TYPE.TRANSACTION_MISSING;
                errorSource = CONST.TELEMETRY.EXPENSE_ERROR_SOURCE.REPORT_ACTION;
            } else {
                errorType = CONST.TELEMETRY.EXPENSE_ERROR_TYPE.TRANSACTION_MISSING;
                errorSource = CONST.TELEMETRY.EXPENSE_ERROR_SOURCE.TRANSACTION;
            }

            const errorValue = Object.values(errors).at(0);
            const errorMessage = typeof errorValue === 'string' ? errorValue : JSON.stringify(errorValue);
            const isRequestPending = transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
            const isTransactionMissing = !transaction?.transactionID && !!linkedTransactionID;

            trackExpenseCreationError(null, {
                errorType,
                errorSource,
                reportID: report.reportID,
                transactionID: linkedTransactionID,
                hasReceipt,
                pendingAction: transaction?.pendingAction,
                iouType,
                errorMessage,
                isRequestPending,
                isTransactionMissing,
            });
        }
        if (transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            if (chatReport?.reportID && getCreationReportErrors(chatReport)) {
                navigateToConciergeChatAndDeleteReport(chatReport.reportID, conciergeReportID, currentUserAccountID, introSelected, isSelfTourViewed, betas, true, true);
                return;
            }
            if (parentReportAction) {
                cleanUpMoneyRequest(
                    transaction?.transactionID ?? linkedTransactionID,
                    parentReportAction,
                    report.reportID,
                    iouReport,
                    chatIOUReport,
                    isChatIOUReportArchived,
                    originalReportID,
                    true,
                );
                return;
            }
        }

        if (!transaction?.transactionID) {
            if (!linkedTransactionID) {
                return;
            }
            clearError(linkedTransactionID);
            clearAllRelatedReportActionErrors(report.reportID, parentReportAction, originalReportID);
            return;
        }
        if (!isEmptyObject(transactionAndReportActionErrors)) {
            revert(transaction, getLastModifiedExpense(report?.reportID));
        }
        if (!isEmptyObject(errorsWithoutReportCreation)) {
            clearError(transaction.transactionID);
            clearAllRelatedReportActionErrors(report.reportID, parentReportAction, originalReportID);
        }
        if (!isEmptyObject(reportCreationError)) {
            if (isInNarrowPaneModal) {
                Navigation.goBack();
            }
            navigateToConciergeChatAndDeleteReport(report.reportID, conciergeReportID, currentUserAccountID, introSelected, isSelfTourViewed, betas, true, true);
        }
    };

    let receiptStyle: StyleProp<ViewStyle>;

    if (fillSpace && shouldShowReceiptEmptyState) {
        receiptStyle = styles.h100;
    } else if (fillSpace) {
        receiptStyle = styles.flexibleHeight;
    } else {
        receiptStyle = shouldUseNarrowLayout ? styles.expenseViewImageSmall : styles.expenseViewImage;
    }

    const showBorderlessLoading = isLoading && fillSpace;

    const isMapDistanceRequest = !!transaction && isDistanceRequest && !isManualDistanceRequest(transaction);

    const canShowReceiptActions = hasReceipt && !isLoading && isEditable && !isMapDistanceRequest && !mergeTransactionID;
    const receiptPendingAction = isDistanceRequest ? getPendingFieldAction('waypoints') : getPendingFieldAction('receipt');
    const isReceiptOfflinePending = isOffline && !!receiptPendingAction;
    const receiptAuditMessagesRow = (
        <View style={[styles.mt3, isEmptyObject(errors) && isDisplayedInWideRHP && styles.mb3]}>
            <ReceiptAuditMessages notes={receiptImageViolations} />
        </View>
    );

    const setReceiptFile = (files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }

        const file = files.at(0);

        if (!file || !linkedTransactionID) {
            return;
        }
        const source = URL.createObjectURL(file as Blob);
        replaceReceipt({transactionID: linkedTransactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
    };

    // For empty receipt should be fullHeight
    // For the rest, expand to match the content
    return (
        <View style={fillSpace ? styles.flex1 : styles.pRelative}>
            {shouldShowReceiptAudit && (
                <OfflineWithFeedback pendingAction={getPendingFieldAction('receipt')}>
                    <ReceiptAudit
                        notes={receiptViolations}
                        shouldShowAuditResult={!!shouldShowAuditMessage}
                    />
                </OfflineWithFeedback>
            )}
            {shouldShowReceiptEmptyState && (
                <OfflineWithFeedback
                    pendingAction={getPendingFieldAction('receipt')}
                    style={[styles.mt3, isEmptyObject(errors) && styles.mb3, styles.flex1]}
                    contentContainerStyle={styles.flex1}
                >
                    <ReceiptEmptyState
                        disabled={!canEditReceipt}
                        onPress={() => {
                            if (!transaction?.transactionID || !report?.reportID) {
                                return;
                            }
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                            );
                        }}
                        isThumbnail={!canEditReceipt}
                        isInMoneyRequestView
                        style={receiptStyle}
                        isDisplayedInWideRHP={isDisplayedInWideRHP}
                        setReceiptFile={setReceiptFile}
                    />
                </OfflineWithFeedback>
            )}
            {(hasReceipt || !isEmptyObject(errors)) && (
                <OfflineWithFeedback
                    shouldDisableOpacity={canShowReceiptActions}
                    pendingAction={receiptPendingAction}
                    errors={errors}
                    errorRowStyles={[styles.mh4, !shouldShowReceiptEmptyState && styles.mt3]}
                    onClose={() => {
                        if (!transaction?.transactionID && !linkedTransactionID) {
                            return;
                        }

                        const errorEntries = Object.entries(errors ?? {});
                        const errorMessages = mapValues(Object.fromEntries(errorEntries), (error) => error);
                        const hasReceiptError = Object.values(errorMessages).some((error) => isReceiptError(error));

                        if (!hasReceiptError) {
                            dismissReceiptError();
                            return;
                        }

                        showConfirmModal({
                            title: translate('iou.dismissReceiptError'),
                            prompt: translate('iou.dismissReceiptErrorConfirmation'),
                            confirmText: translate('common.dismiss'),
                            cancelText: translate('common.cancel'),
                            shouldShowCancelButton: true,
                            danger: true,
                        }).then((result) => {
                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }
                            dismissReceiptError();
                        });
                    }}
                    dismissError={dismissReceiptError}
                    style={[shouldShowAuditMessage ? styles.mt3 : styles.mv3, !showReceiptErrorWithEmptyState && styles.flex1]}
                    contentContainerStyle={styles.flex1}
                >
                    {hasReceipt && (
                        <View
                            ref={receiptContainerRef}
                            style={[styles.getMoneyRequestViewImage(showBorderlessLoading), receiptStyle, showBorderlessLoading && styles.flex1]}
                            onMouseEnter={() => !isLoading && hoverBind.onMouseEnter()}
                            onMouseLeave={hoverBind.onMouseLeave}
                        >
                            <View style={[styles.flex1, isReceiptOfflinePending && styles.offlineFeedbackPending]}>
                                <ReportActionItemImage
                                    shouldUseThumbnailImage={!fillSpace}
                                    shouldUseFullHeight={fillSpace}
                                    thumbnail={receiptURIs?.thumbnail}
                                    fileExtension={receiptURIs?.fileExtension}
                                    isThumbnail={receiptURIs?.isThumbnail}
                                    image={receiptURIs?.image}
                                    isLocalFile={receiptURIs?.isLocalFile}
                                    filename={receiptURIs?.filename}
                                    transaction={updatedTransaction ?? transaction}
                                    enablePreviewModal
                                    readonly={readonly || !canEditReceipt}
                                    mergeTransactionID={mergeTransactionID}
                                    report={report}
                                    onLoad={() => setIsLoading(false)}
                                    onLoadFailure={() => setIsLoading(false)}
                                />
                            </View>
                            {canShowReceiptActions && (
                                <View style={[styles.receiptActionButtonsContainer, styles.pointerEventsBoxNone, !hovered && !isPickerOpen && deviceHasHoverSupport && styles.opacity0]}>
                                    <AttachmentPicker acceptedFileTypes={[...CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS]}>
                                        {({openPicker}) => (
                                            <Tooltip text={translate('receipt.addAdditionalReceipt')}>
                                                <PressableWithoutFeedback
                                                    ref={addButtonRef}
                                                    onPress={() => {
                                                        setIsPickerOpen(true);
                                                        resetButtonHoverState(addButtonRef);
                                                        const onPickerClosed = () => {
                                                            setIsPickerOpen(false);
                                                            if (isElementHovered(receiptContainerRef)) {
                                                                hoverBind.onMouseEnter();
                                                            }
                                                        };
                                                        openPicker({
                                                            onPicked: (files) => {
                                                                onPickerClosed();
                                                                validateFiles(files, undefined, {isValidatingReceipts: false});
                                                            },
                                                            onCanceled: onPickerClosed,
                                                        });
                                                    }}
                                                    style={styles.receiptActionButton}
                                                    hoverStyle={styles.buttonDefaultHovered}
                                                    accessibilityLabel={translate('receipt.addAdditionalReceipt')}
                                                    role={CONST.ROLE.BUTTON}
                                                    sentryLabel={CONST.SENTRY_LABEL.RECEIPT.ADD_ATTACHMENT_BUTTON}
                                                >
                                                    <Icon
                                                        src={lazyIcons.ReceiptPlus}
                                                        height={variables.iconSizeSmall}
                                                        width={variables.iconSizeSmall}
                                                        fill={theme.icon}
                                                    />
                                                </PressableWithoutFeedback>
                                            </Tooltip>
                                        )}
                                    </AttachmentPicker>
                                    <Tooltip text={translate('reportActionCompose.expand')}>
                                        <PressableWithoutFocus
                                            onPress={() =>
                                                Navigation.navigate(
                                                    ROUTES.TRANSACTION_RECEIPT.getRoute(report?.reportID, (updatedTransaction ?? transaction)?.transactionID, readonly || !canEditReceipt),
                                                )
                                            }
                                            style={styles.receiptActionButton}
                                            hoverStyle={styles.buttonDefaultHovered}
                                            accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                                            role={CONST.ROLE.BUTTON}
                                            sentryLabel={CONST.SENTRY_LABEL.RECEIPT.ENLARGE_BUTTON}
                                        >
                                            <Icon
                                                src={lazyIcons.Expand}
                                                height={variables.iconSizeSmall}
                                                width={variables.iconSizeSmall}
                                                fill={theme.icon}
                                            />
                                        </PressableWithoutFocus>
                                    </Tooltip>
                                </View>
                            )}
                        </View>
                    )}
                    {/* For WideRHP (fillSpace is true), we need to wait for the image to load to get the correct size, then display the violation message to avoid the jumping issue.
                        Otherwise (when fillSpace is false), we use a fixed size, so there's no need to wait for the image to load. */}
                    {!!shouldShowAuditMessage && hasReceipt && (!isLoading || !fillSpace) && receiptAuditMessagesRow}
                </OfflineWithFeedback>
            )}
            {!shouldShowReceiptEmptyState && !hasReceipt && <View style={{marginVertical: 6}} />}
            {!!shouldShowAuditMessage && !hasReceipt && receiptAuditMessagesRow}
            {AttachmentErrorModal}
            {PDFValidationComponent}
        </View>
    );
}

export default MoneyRequestReceiptView;
