import mapValues from 'lodash/mapValues';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReceiptAudit, {ReceiptAuditMessages} from '@components/ReceiptAudit';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import useActiveRoute from '@hooks/useActiveRoute';
import useEnvironment from '@hooks/useEnvironment';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {getMicroSecondOnyxErrorWithTranslationKey, isReceiptError} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getCreationReportErrors,
    isInvoiceReport,
    isPaidGroupPolicy,
    isTrackExpenseReportNew,
} from '@libs/ReportUtils';
import {
    didReceiptScanSucceed as didReceiptScanSucceedTransactionUtils,
    hasReceipt as hasReceiptTransactionUtils,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isScanning,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import {cleanUpMoneyRequest} from '@userActions/IOU';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import {clearAllRelatedReportActionErrors} from '@userActions/ReportActions';
import {clearError, getLastModifiedExpense, revert} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionPendingFieldsKey} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ReportActionItemImage from './ReportActionItemImage';

type MoneyRequestReceiptViewProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<OnyxTypes.Report>;

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
};

const receiptImageViolationNames = new Set<OnyxTypes.ViolationName>([
    CONST.VIOLATIONS.RECEIPT_REQUIRED,
    CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
    CONST.VIOLATIONS.CASH_EXPENSE_WITH_NO_RECEIPT,
    CONST.VIOLATIONS.SMARTSCAN_FAILED,
    CONST.VIOLATIONS.PROHIBITED_EXPENSE,
    CONST.VIOLATIONS.RECEIPT_GENERATED_WITH_AI,
]);

const receiptFieldViolationNames = new Set<OnyxTypes.ViolationName>([CONST.VIOLATIONS.MODIFIED_AMOUNT, CONST.VIOLATIONS.MODIFIED_DATE]);

function MoneyRequestReceiptView({
    allReports,
    report,
    readonly = false,
    updatedTransaction,
    fillSpace = false,
    mergeTransactionID,
    isDisplayedInWideRHP = false,
}: MoneyRequestReceiptViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {getReportRHPActiveRoute} = useActiveRoute();
    const parentReportID = report?.parentReportID;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.parentReportID}`];
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        canEvict: false,
        canBeMissing: true,
    });

    const [isLoading, setIsLoading] = useState(true);
    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
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

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(linkedTransactionID)}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${moneyRequestReport?.policyID}`, {canBeMissing: true});
    const transactionViolations = useTransactionViolations(transaction?.transactionID);

    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const hasReceipt = hasReceiptTransactionUtils(updatedTransaction ?? transaction);
    const isTransactionScanning = isScanning(updatedTransaction ?? transaction);
    const didReceiptScanSucceed = hasReceipt && didReceiptScanSucceedTransactionUtils(transaction);
    const isInvoice = isInvoiceReport(moneyRequestReport);
    const isChatReportArchived = useReportIsArchived(moneyRequestReport?.chatReportID);

    // Flags for allowing or disallowing editing an expense
    // Used for non-restricted fields such as: description, category, tag, billable, etc...
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isEditable = !!canUserPerformWriteActionReportUtils(report, isReportArchived) && !readonly;
    const canEdit = isMoneyRequestAction(parentReportAction) && canEditMoneyRequest(parentReportAction, isChatReportArchived, moneyRequestReport, policy, transaction) && isEditable;
    const companyCardPageURL = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(report?.policyID)}`;

    const canEditReceipt = isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT, undefined, isChatReportArchived);

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
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => (pendingAction ? undefined : transaction?.pendingFields?.[fieldPath]);

    const transactionToCheck = updatedTransaction ?? transaction;
    const doesTransactionHaveReceipt = !!transactionToCheck?.receipt && !isEmptyObject(transactionToCheck?.receipt);
    const shouldShowReceiptEmptyState = !isInvoice && !hasReceipt && !!transactionToCheck && !doesTransactionHaveReceipt;

    const [receiptImageViolations, receiptViolations] = useMemo(() => {
        const imageViolations = [];
        const allViolations = [];

        for (const violation of transactionViolations ?? []) {
            const isReceiptFieldViolation = receiptFieldViolationNames.has(violation.name);
            const isReceiptImageViolation = receiptImageViolationNames.has(violation.name);
            if (isReceiptFieldViolation || isReceiptImageViolation) {
                const violationMessage = ViolationsUtils.getViolationTranslation(violation, translate, canEdit, undefined, companyCardPageURL);
                allViolations.push(violationMessage);
                if (isReceiptImageViolation) {
                    imageViolations.push(violationMessage);
                }
            }
        }
        return [imageViolations, allViolations];
    }, [transactionViolations, translate, canEdit, companyCardPageURL]);

    const receiptRequiredViolation = transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.RECEIPT_REQUIRED);
    const customRulesViolation = transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_RULES);

    // Whether to show receipt audit result (e.g.`Verified`, `Issue Found`) and messages (e.g. `Receipt not verified. Please confirm accuracy.`)
    // `!!(receiptViolations.length || didReceiptScanSucceed)` is for not showing `Verified` when `receiptViolations` is empty and `didReceiptScanSucceed` is false.
    const shouldShowAuditMessage =
        !isTransactionScanning && (hasReceipt || !!receiptRequiredViolation || !!customRulesViolation) && !!(receiptViolations.length || didReceiptScanSucceed) && isPaidGroupPolicy(report);
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

    const [showConfirmDismissReceiptError, setShowConfirmDismissReceiptError] = useState(false);

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
        if (transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            if (chatReport?.reportID && getCreationReportErrors(chatReport)) {
                navigateToConciergeChatAndDeleteReport(chatReport.reportID, true, true);
                return;
            }
            if (parentReportAction) {
                cleanUpMoneyRequest(transaction?.transactionID ?? linkedTransactionID, parentReportAction, report.reportID, iouReport, chatIOUReport, isChatIOUReportArchived, true);
                return;
            }
        }
        if (!transaction?.transactionID) {
            if (!linkedTransactionID) {
                return;
            }
            clearError(linkedTransactionID);
            clearAllRelatedReportActionErrors(report.reportID, parentReportAction);
            return;
        }
        if (!isEmptyObject(transactionAndReportActionErrors)) {
            revert(transaction, getLastModifiedExpense(report?.reportID));
        }
        if (!isEmptyObject(errorsWithoutReportCreation)) {
            clearError(transaction.transactionID);
            clearAllRelatedReportActionErrors(report.reportID, parentReportAction);
        }
        if (!isEmptyObject(reportCreationError)) {
            if (isInNarrowPaneModal) {
                Navigation.goBack();
            }
            navigateToConciergeChatAndDeleteReport(report.reportID, true, true);
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

    const receiptAuditMessagesRow = (
        <View style={[styles.mt3, isEmptyObject(errors) && isDisplayedInWideRHP && styles.mb3]}>
            <ReceiptAuditMessages notes={receiptImageViolations} />
        </View>
    );

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
                    />
                </OfflineWithFeedback>
            )}
            {(hasReceipt || !isEmptyObject(errors)) && (
                <OfflineWithFeedback
                    pendingAction={isDistanceRequest ? getPendingFieldAction('waypoints') : getPendingFieldAction('receipt')}
                    errors={errors}
                    errorRowStyles={[styles.mh4, !shouldShowReceiptEmptyState && styles.mt3]}
                    onClose={() => {
                        if (!transaction?.transactionID && !linkedTransactionID) {
                            return;
                        }

                        const errorEntries = Object.entries(errors ?? {});
                        const errorMessages = mapValues(Object.fromEntries(errorEntries), (error) => error);
                        const hasReceiptError = Object.values(errorMessages).some((error) => isReceiptError(error));

                        if (hasReceiptError) {
                            setShowConfirmDismissReceiptError(true);
                        } else {
                            dismissReceiptError();
                        }
                    }}
                    dismissError={dismissReceiptError}
                    style={[shouldShowAuditMessage ? styles.mt3 : styles.mv3, !showReceiptErrorWithEmptyState && styles.flex1]}
                    contentContainerStyle={styles.flex1}
                >
                    {hasReceipt && (
                        <View style={[styles.getMoneyRequestViewImage(showBorderlessLoading), receiptStyle, showBorderlessLoading && styles.flex1]}>
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
                    )}
                    {/* For WideRHP (fillSpace is true), we need to wait for the image to load to get the correct size, then display the violation message to avoid the jumping issue.
                        Otherwise (when fillSpace is false), we use a fixed size, so there's no need to wait for the image to load. */}
                    {!!shouldShowAuditMessage && hasReceipt && (!isLoading || !fillSpace) && receiptAuditMessagesRow}
                </OfflineWithFeedback>
            )}
            {!shouldShowReceiptEmptyState && !hasReceipt && <View style={{marginVertical: 6}} />}
            {!!shouldShowAuditMessage && !hasReceipt && receiptAuditMessagesRow}
            <ConfirmModal
                isVisible={showConfirmDismissReceiptError}
                onConfirm={() => {
                    dismissReceiptError();
                    setShowConfirmDismissReceiptError(false);
                }}
                onCancel={() => {
                    setShowConfirmDismissReceiptError(false);
                }}
                title={translate('iou.dismissReceiptError')}
                prompt={translate('iou.dismissReceiptErrorConfirmation')}
                confirmText={translate('common.dismiss')}
                cancelText={translate('common.cancel')}
                shouldShowCancelButton
                danger
            />
        </View>
    );
}

export default MoneyRequestReceiptView;
