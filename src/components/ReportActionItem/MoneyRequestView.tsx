import mapValues from 'lodash/mapValues';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useSession} from '@components/OnyxProvider';
import ReceiptAudit, {ReceiptAuditMessages} from '@components/ReceiptAudit';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import Switch from '@components/Switch';
import Text from '@components/Text';
import ViolationMessages from '@components/ViolationMessages';
import useActiveRoute from '@hooks/useActiveRoute';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import useViolations from '@hooks/useViolations';
import type {ViolationField} from '@hooks/useViolations';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isReceiptError} from '@libs/ErrorUtils';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getTagLists, hasDependentTags, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, isMoneyRequestAction, isPayAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getAddWorkspaceRoomOrChatReportErrors,
    getTransactionDetails,
    getTripIDFromTransactionParentReportID,
    isInvoiceReport,
    isMoneyRequestReport,
    isPaidGroupPolicy,
    isReportApproved,
    isReportInGroupPolicy,
    isSettled as isSettledReportUtils,
    isTrackExpenseReport,
} from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {
    didReceiptScanSucceed as didReceiptScanSucceedTransactionUtils,
    getBillable,
    getCardName,
    getDescription,
    getDistanceInMeters,
    getTagForDisplay,
    getTaxName,
    hasMissingSmartscanFields,
    hasReceipt as hasReceiptTransactionUtils,
    hasReservationList,
    hasRoute as hasRouteTransactionUtils,
    isCardTransaction as isCardTransactionTransactionUtils,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isReceiptBeingScanned as isReceiptBeingScannedTransactionUtils,
    shouldShowAttendees as shouldShowAttendeesTransactionUtils,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import {cleanUpMoneyRequest, updateMoneyRequestBillable} from '@userActions/IOU';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import {clearAllRelatedReportActionErrors} from '@userActions/ReportActions';
import {clearError, getLastModifiedExpense, revert} from '@userActions/Transaction';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionPendingFieldsKey} from '@src/types/onyx/Transaction';
import ReportActionItemImage from './ReportActionItemImage';

type MoneyRequestViewProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Whether we should display the animated banner above the component */
    shouldShowAnimatedBackground: boolean;

    /** Whether we should show Money Request with disabled all fields */
    readonly?: boolean;

    /** whether or not this report is from review duplicates */
    isFromReviewDuplicates?: boolean;

    /** Updated transaction to show in duplicate transaction flow  */
    updatedTransaction?: OnyxEntry<OnyxTypes.Transaction>;
};

const receiptImageViolationNames: OnyxTypes.ViolationName[] = [
    CONST.VIOLATIONS.RECEIPT_REQUIRED,
    CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
    CONST.VIOLATIONS.CASH_EXPENSE_WITH_NO_RECEIPT,
    CONST.VIOLATIONS.SMARTSCAN_FAILED,
    CONST.VIOLATIONS.PROHIBITED_EXPENSE,
];

const receiptFieldViolationNames: OnyxTypes.ViolationName[] = [CONST.VIOLATIONS.MODIFIED_AMOUNT, CONST.VIOLATIONS.MODIFIED_DATE];

function MoneyRequestView({report, shouldShowAnimatedBackground, readonly = false, updatedTransaction, isFromReviewDuplicates = false}: MoneyRequestViewProps) {
    const styles = useThemeStyles();
    const session = useSession();
    const {isOffline} = useNetwork();
    const {translate, toLocaleDigit} = useLocalize();
    const {getReportRHPActiveRoute} = useActiveRoute();
    const parentReportID = report?.parentReportID;
    const policyID = report?.policyID;
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.parentReportID ?? CONST.DEFAULT_NUMBER_ID}`, {
        selector: (chatReportValue) => chatReportValue && {reportID: chatReportValue.reportID, errorFields: chatReportValue.errorFields},
    });
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${updatedTransaction?.reportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const targetPolicyID = updatedTransaction?.reportID ? transactionReport?.policyID : policyID;
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicyID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID ?? CONST.DEFAULT_NUMBER_ID}`, {
        canEvict: false,
    });

    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const isTrackExpense = isTrackExpenseReport(report);
    const moneyRequestReport = parentReport;
    const linkedTransactionID = useMemo(() => {
        if (!parentReportAction) {
            return undefined;
        }
        const originalMessage = parentReportAction && isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction) : undefined;
        return originalMessage?.IOUTransactionID;
    }, [parentReportAction]);

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${linkedTransactionID ?? CONST.DEFAULT_NUMBER_ID}`);
    const transactionViolations = useTransactionViolations(transaction?.transactionID);

    const {
        created: transactionDate,
        amount: transactionAmount,
        attendees: transactionAttendees,
        taxAmount: transactionTaxAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        billable: transactionBillable,
        category: transactionCategory,
        tag: transactionTag,
        originalAmount: transactionOriginalAmount,
        originalCurrency: transactionOriginalCurrency,
        postedDate: transactionPostedDate,
    } = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);
    const isEmptyMerchant = transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);
    const hasRoute = hasRouteTransactionUtils(transactionBackup ?? transaction, isDistanceRequest);
    const shouldDisplayTransactionAmount = ((isDistanceRequest && hasRoute) || !!transactionAmount) && transactionAmount !== undefined;
    const formattedTransactionAmount = shouldDisplayTransactionAmount ? convertToDisplayString(transactionAmount, transactionCurrency) : '';
    const formattedPerAttendeeAmount = shouldDisplayTransactionAmount ? convertToDisplayString(transactionAmount / (transactionAttendees?.length ?? 1), transactionCurrency) : '';
    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isCardTransaction = isCardTransactionTransactionUtils(transaction);
    const cardProgramName = getCardName(transaction);
    const shouldShowCard = isCardTransaction && cardProgramName;
    const isApproved = isReportApproved({report: moneyRequestReport});
    const isInvoice = isInvoiceReport(moneyRequestReport);
    const isPaidReport = isPayAction(parentReportAction);
    const taxRates = policy?.taxRates;
    const formattedTaxAmount = updatedTransaction?.taxAmount
        ? convertToDisplayString(Math.abs(updatedTransaction?.taxAmount), transactionCurrency)
        : convertToDisplayString(Math.abs(transactionTaxAmount ?? 0), transactionCurrency);

    const taxRatesDescription = taxRates?.name;
    const taxRateTitle = updatedTransaction ? getTaxName(policy, updatedTransaction) : getTaxName(policy, transaction);

    const isSettled = isSettledReportUtils(moneyRequestReport?.reportID);
    const isCancelled = moneyRequestReport && moneyRequestReport?.isCancelledIOU;

    // Flags for allowing or disallowing editing an expense
    // Used for non-restricted fields such as: description, category, tag, billable, etc...
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report) && !readonly;
    const canEdit = isMoneyRequestAction(parentReportAction) && canEditMoneyRequest(parentReportAction, transaction) && canUserPerformWriteAction;

    const canEditTaxFields = canEdit && !isDistanceRequest;
    const canEditAmount = canUserPerformWriteAction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT);
    const canEditMerchant = canUserPerformWriteAction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.MERCHANT);
    const canEditDate = canUserPerformWriteAction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DATE);
    const canEditReceipt = canUserPerformWriteAction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const hasReceipt = hasReceiptTransactionUtils(updatedTransaction ?? transaction);
    const isReceiptBeingScanned = hasReceipt && isReceiptBeingScannedTransactionUtils(updatedTransaction ?? transaction);
    const didReceiptScanSucceed = hasReceipt && didReceiptScanSucceedTransactionUtils(transaction);
    const canEditDistance = canUserPerformWriteAction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DISTANCE);
    const canEditDistanceRate = canUserPerformWriteAction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DISTANCE_RATE);

    const isAdmin = policy?.role === 'admin';
    const isApprover = isMoneyRequestReport(moneyRequestReport) && moneyRequestReport?.managerID !== null && session?.accountID === moneyRequestReport?.managerID;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isRequestor = currentUserPersonalDetails.accountID === parentReportAction?.actorAccountID;

    // A flag for verifying that the current report is a sub-report of a workspace chat
    // if the policy of the report is either Collect or Control, then this report must be tied to workspace chat
    const isPolicyExpenseChat = isReportInGroupPolicy(report);

    const policyTagLists = useMemo(() => getTagLists(policyTagList), [policyTagList]);

    const iouType = isTrackExpense ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

    // Flags for showing categories and tags
    // transactionCategory can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowCategory = isPolicyExpenseChat && (transactionCategory || hasEnabledOptions(policyCategories ?? {}));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowTag = isPolicyExpenseChat && (transactionTag || hasEnabledTags(policyTagLists));
    const shouldShowBillable = isPolicyExpenseChat && (!!transactionBillable || !(policy?.disabledFields?.defaultBillable ?? true) || !!updatedTransaction?.billable);
    const shouldShowAttendees = useMemo(() => shouldShowAttendeesTransactionUtils(iouType, policy), [iouType, policy]);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest, isPerDiemRequest);
    const tripID = getTripIDFromTransactionParentReportID(parentReport?.parentReportID);
    const shouldShowViewTripDetails = hasReservationList(transaction) && !!tripID;

    const {getViolationsForField} = useViolations(transactionViolations ?? [], isReceiptBeingScanned || !isPaidGroupPolicy(report));
    const hasViolations = useCallback(
        (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string): boolean =>
            getViolationsForField(field, data, policyHasDependentTags, tagValue).length > 0,
        [getViolationsForField],
    );

    let amountDescription = `${translate('iou.amount')}`;
    let dateDescription = `${translate('common.date')}`;

    const {unit, rate} = DistanceRequestUtils.getRate({transaction, policy});
    const distance = getDistanceInMeters(transactionBackup ?? transaction, unit);
    const currency = transactionCurrency ?? CONST.CURRENCY.USD;
    const rateToDisplay = DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline);
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate);
    let merchantTitle = isEmptyMerchant ? '' : transactionMerchant;
    let amountTitle = formattedTransactionAmount ? formattedTransactionAmount.toString() : '';
    if (hasReceiptTransactionUtils(transaction) && isReceiptBeingScannedTransactionUtils(transaction)) {
        merchantTitle = translate('iou.receiptStatusTitle');
        amountTitle = translate('iou.receiptStatusTitle');
    }

    const isCustomUnitOutOfPolicy = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY);

    const updatedTransactionDescription = useMemo(() => {
        if (!updatedTransaction) {
            return undefined;
        }
        return getDescription(updatedTransaction ?? null);
    }, [updatedTransaction]);
    const isEmptyUpdatedMerchant = updatedTransaction?.modifiedMerchant === '' || updatedTransaction?.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const updatedMerchantTitle = isEmptyUpdatedMerchant ? '' : updatedTransaction?.modifiedMerchant ?? merchantTitle;

    const saveBillable = useCallback(
        (newBillable: boolean) => {
            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newBillable === getBillable(transaction) || !transaction?.transactionID || !report?.reportID) {
                return;
            }
            updateMoneyRequestBillable(transaction.transactionID, report?.reportID, newBillable, policy, policyTagList, policyCategories);
        },
        [transaction, report, policy, policyTagList, policyCategories],
    );

    if (isCardTransaction) {
        if (transactionPostedDate) {
            dateDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.posted')} ${transactionPostedDate}`;
        }
        if (formattedOriginalAmount) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.original')} ${formattedOriginalAmount}`;
        }
        if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        }
    } else {
        if (!isDistanceRequest && !isPerDiemRequest) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.cash')}`;
        }
        if (isApproved) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
        } else if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        } else if (isSettled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.settledExpensify')}`;
        }
    }

    let receiptURIs;
    const hasErrors = hasMissingSmartscanFields(transaction);
    if (hasReceipt) {
        receiptURIs = getThumbnailAndImageURIs(updatedTransaction ?? transaction);
    }
    const pendingAction = transaction?.pendingAction;
    // Need to return undefined when we have pendingAction to avoid the duplicate pending action
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => (pendingAction ? undefined : transaction?.pendingFields?.[fieldPath]);

    const getErrorForField = useCallback(
        (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string) => {
            // Checks applied when creating a new expense
            // NOTE: receipt field can return multiple violations, so we need to handle it separately
            const fieldChecks: Partial<Record<ViolationField, {isError: boolean; translationPath: TranslationPaths}>> = {
                amount: {
                    isError: transactionAmount === 0,
                    translationPath: canEditAmount ? 'common.error.enterAmount' : 'common.error.missingAmount',
                },
                merchant: {
                    isError: !isSettled && !isCancelled && isPolicyExpenseChat && isEmptyMerchant,
                    translationPath: canEditMerchant ? 'common.error.enterMerchant' : 'common.error.missingMerchantName',
                },
                date: {
                    isError: transactionDate === '',
                    translationPath: canEditDate ? 'common.error.enterDate' : 'common.error.missingDate',
                },
            };

            const {isError, translationPath} = fieldChecks[field] ?? {};

            if (readonly) {
                return '';
            }

            // Return form errors if there are any
            if (hasErrors && isError && translationPath) {
                return translate(translationPath);
            }

            // Return violations if there are any
            if (field !== 'merchant' && hasViolations(field, data, policyHasDependentTags, tagValue)) {
                const violations = getViolationsForField(field, data, policyHasDependentTags, tagValue);
                const firstViolation = violations.at(0);

                if (firstViolation) {
                    return ViolationsUtils.getViolationTranslation(firstViolation, translate, canEdit);
                }
            }

            return '';
        },
        [
            transactionAmount,
            isSettled,
            isCancelled,
            isPolicyExpenseChat,
            isEmptyMerchant,
            transactionDate,
            readonly,
            hasErrors,
            hasViolations,
            translate,
            getViolationsForField,
            canEditAmount,
            canEditDate,
            canEditMerchant,
            canEdit,
        ],
    );

    const distanceRequestFields = (
        <>
            <OfflineWithFeedback pendingAction={getPendingFieldAction('waypoints') ?? getPendingFieldAction('merchant')}>
                <MenuItemWithTopDescription
                    description={translate('common.distance')}
                    title={distanceToDisplay}
                    interactive={canEditDistance}
                    shouldShowRightIcon={canEditDistance}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transaction?.transactionID || !report?.reportID) {
                            return;
                        }
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                        );
                    }}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={getPendingFieldAction('customUnitRateID')}>
                <MenuItemWithTopDescription
                    description={translate('common.rate')}
                    title={isCustomUnitOutOfPolicy ? translate('common.rateOutOfPolicy') : rateToDisplay}
                    interactive={canEditDistanceRate}
                    shouldShowRightIcon={canEditDistanceRate}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transaction?.transactionID || !report?.reportID) {
                            return;
                        }
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                        );
                    }}
                    brickRoadIndicator={getErrorForField('customUnitRateID') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={getErrorForField('customUnitRateID')}
                />
            </OfflineWithFeedback>
        </>
    );

    const isReceiptAllowed = !isPaidReport && !isInvoice;
    const shouldShowReceiptEmptyState =
        isReceiptAllowed && !hasReceipt && !isApproved && !isSettled && (canEditReceipt || isAdmin || isApprover || isRequestor) && (canEditReceipt || isPaidGroupPolicy(report));

    const [receiptImageViolations, receiptViolations] = useMemo(() => {
        const imageViolations = [];
        const allViolations = [];

        for (const violation of transactionViolations ?? []) {
            const isReceiptFieldViolation = receiptFieldViolationNames.includes(violation.name);
            const isReceiptImageViolation = receiptImageViolationNames.includes(violation.name);
            if (isReceiptFieldViolation || isReceiptImageViolation) {
                const violationMessage = ViolationsUtils.getViolationTranslation(violation, translate, canEdit);
                allViolations.push(violationMessage);
                if (isReceiptImageViolation) {
                    imageViolations.push(violationMessage);
                }
            }
        }
        return [imageViolations, allViolations];
    }, [transactionViolations, translate, canEdit]);

    const receiptRequiredViolation = transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.RECEIPT_REQUIRED);
    const customRulesViolation = transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_RULES);

    // Whether to show receipt audit result (e.g.`Verified`, `Issue Found`) and messages (e.g. `Receipt not verified. Please confirm accuracy.`)
    // `!!(receiptViolations.length || didReceiptScanSucceed)` is for not showing `Verified` when `receiptViolations` is empty and `didReceiptScanSucceed` is false.
    const shouldShowAuditMessage =
        !isReceiptBeingScanned && (hasReceipt || !!receiptRequiredViolation || !!customRulesViolation) && !!(receiptViolations.length || didReceiptScanSucceed) && isPaidGroupPolicy(report);
    const shouldShowReceiptAudit = isReceiptAllowed && (shouldShowReceiptEmptyState || hasReceipt);

    const errors = {
        ...(transaction?.errorFields?.route ?? transaction?.errorFields?.waypoints ?? transaction?.errors),
        ...parentReportAction?.errors,
    };

    const tagList = policyTagLists.map(({name, orderWeight, tags}, index) => {
        const tagForDisplay = getTagForDisplay(updatedTransaction ?? transaction, index);
        const shouldShow = !!tagForDisplay || hasEnabledOptions(tags);
        if (!shouldShow) {
            return null;
        }

        const tagError = getErrorForField(
            'tag',
            {
                tagListIndex: index,
                tagListName: name,
            },
            hasDependentTags(policy, policyTagList),
            tagForDisplay,
        );
        return (
            <OfflineWithFeedback
                key={name}
                pendingAction={getPendingFieldAction('tag')}
            >
                <MenuItemWithTopDescription
                    description={name ?? translate('common.tag')}
                    title={tagForDisplay}
                    interactive={canEdit}
                    shouldShowRightIcon={canEdit}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transaction?.transactionID || !report?.reportID) {
                            return;
                        }
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(CONST.IOU.ACTION.EDIT, iouType, orderWeight, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                        );
                    }}
                    brickRoadIndicator={tagError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={tagError}
                />
            </OfflineWithFeedback>
        );
    });

    const [showConfirmDismissReceiptError, setShowConfirmDismissReceiptError] = useState(false);

    const dismissReceiptError = useCallback(() => {
        if (!report?.reportID) {
            return;
        }
        if (transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            if (chatReport?.reportID && getAddWorkspaceRoomOrChatReportErrors(chatReport)) {
                navigateToConciergeChatAndDeleteReport(chatReport.reportID, true, true);
                return;
            }
            if (parentReportAction) {
                cleanUpMoneyRequest(transaction?.transactionID ?? linkedTransactionID, parentReportAction, report.reportID, true);
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
        revert(transaction?.transactionID ?? linkedTransactionID, getLastModifiedExpense(report?.reportID));
        clearError(transaction.transactionID);
        clearAllRelatedReportActionErrors(report.reportID, parentReportAction);
    }, [transaction, chatReport, parentReportAction, linkedTransactionID, report?.reportID]);

    return (
        <View style={styles.pRelative}>
            {shouldShowAnimatedBackground && <AnimatedEmptyStateBackground />}
            <>
                {shouldShowReceiptAudit && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('receipt')}>
                        <ReceiptAudit
                            notes={receiptViolations}
                            shouldShowAuditResult={!!shouldShowAuditMessage}
                        />
                    </OfflineWithFeedback>
                )}
                {(hasReceipt || !!errors) && (
                    <OfflineWithFeedback
                        pendingAction={isDistanceRequest ? getPendingFieldAction('waypoints') : getPendingFieldAction('receipt')}
                        errors={errors}
                        errorRowStyles={[styles.mh4]}
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
                    >
                        {hasReceipt && (
                            <View style={[styles.moneyRequestViewImage, styles.expenseViewImage]}>
                                <ReportActionItemImage
                                    thumbnail={receiptURIs?.thumbnail}
                                    fileExtension={receiptURIs?.fileExtension}
                                    isThumbnail={receiptURIs?.isThumbnail}
                                    image={receiptURIs?.image}
                                    isLocalFile={receiptURIs?.isLocalFile}
                                    filename={receiptURIs?.filename}
                                    transaction={updatedTransaction ?? transaction}
                                    enablePreviewModal
                                    readonly={readonly || !canEditReceipt}
                                    isFromReviewDuplicates={isFromReviewDuplicates}
                                />
                            </View>
                        )}
                    </OfflineWithFeedback>
                )}
                {shouldShowReceiptEmptyState && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('receipt')}>
                        <ReceiptEmptyState
                            hasError={hasErrors}
                            disabled={!canEditReceipt}
                            onPress={() => {
                                if (!transaction?.transactionID || !report?.reportID) {
                                    return;
                                }
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                                );
                            }}
                            isInMoneyRequestView
                        />
                    </OfflineWithFeedback>
                )}
                {!shouldShowReceiptEmptyState && !hasReceipt && <View style={{marginVertical: 6}} />}
                {!!shouldShowAuditMessage && <ReceiptAuditMessages notes={receiptImageViolations} />}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('amount') ?? (amountTitle ? getPendingFieldAction('customUnitRateID') : undefined)}>
                    <MenuItemWithTopDescription
                        title={amountTitle}
                        shouldShowTitleIcon={isSettled}
                        titleIcon={Expensicons.Checkmark}
                        description={amountDescription}
                        titleStyle={styles.textHeadlineH2}
                        interactive={canEditAmount}
                        shouldShowRightIcon={canEditAmount}
                        onPress={() => {
                            if (!transaction?.transactionID || !report?.reportID) {
                                return;
                            }
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, '', getReportRHPActiveRoute()),
                            );
                        }}
                        brickRoadIndicator={getErrorForField('amount') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('amount')}
                    />
                </OfflineWithFeedback>
                <OfflineWithFeedback pendingAction={getPendingFieldAction('comment')}>
                    <MenuItemWithTopDescription
                        description={translate('common.description')}
                        shouldRenderAsHTML
                        title={updatedTransactionDescription ?? transactionDescription}
                        interactive={canEdit}
                        shouldShowRightIcon={canEdit}
                        titleStyle={styles.flex1}
                        onPress={() => {
                            if (!transaction?.transactionID || !report?.reportID) {
                                return;
                            }
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                            );
                        }}
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        brickRoadIndicator={getErrorForField('comment') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('comment')}
                        numberOfLinesTitle={0}
                    />
                </OfflineWithFeedback>
                {isDistanceRequest ? (
                    distanceRequestFields
                ) : (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('merchant')}>
                        <MenuItemWithTopDescription
                            description={translate('common.merchant')}
                            title={updatedMerchantTitle}
                            interactive={canEditMerchant}
                            shouldShowRightIcon={canEditMerchant}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!transaction?.transactionID || !report?.reportID) {
                                    return;
                                }
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                                );
                            }}
                            wrapperStyle={[styles.taskDescriptionMenuItem]}
                            brickRoadIndicator={getErrorForField('merchant') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('merchant')}
                            numberOfLinesTitle={0}
                        />
                    </OfflineWithFeedback>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('created')}>
                    <MenuItemWithTopDescription
                        description={dateDescription}
                        title={transactionDate}
                        interactive={canEditDate}
                        shouldShowRightIcon={canEditDate}
                        titleStyle={styles.flex1}
                        onPress={() => {
                            if (!transaction?.transactionID || !report?.reportID) {
                                return;
                            }
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                            );
                        }}
                        brickRoadIndicator={getErrorForField('date') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('date')}
                    />
                </OfflineWithFeedback>
                {!!shouldShowCategory && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('category')}>
                        <MenuItemWithTopDescription
                            description={translate('common.category')}
                            title={updatedTransaction?.category ?? transactionCategory}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!transaction?.transactionID || !report?.reportID) {
                                    return;
                                }
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                                );
                            }}
                            brickRoadIndicator={getErrorForField('category') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('category')}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTag && tagList}
                {!!shouldShowCard && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('cardID')}>
                        <MenuItemWithTopDescription
                            description={translate('iou.card')}
                            title={cardProgramName}
                            titleStyle={styles.flex1}
                            interactive={false}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxCode')}>
                        <MenuItemWithTopDescription
                            title={taxRateTitle ?? ''}
                            description={taxRatesDescription}
                            interactive={canEditTaxFields}
                            shouldShowRightIcon={canEditTaxFields}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!transaction?.transactionID || !report?.reportID) {
                                    return;
                                }
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                                );
                            }}
                            brickRoadIndicator={getErrorForField('tax') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('tax')}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxAmount')}>
                        <MenuItemWithTopDescription
                            title={formattedTaxAmount ? formattedTaxAmount.toString() : ''}
                            description={translate('iou.taxAmount')}
                            interactive={canEditTaxFields}
                            shouldShowRightIcon={canEditTaxFields}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!transaction?.transactionID || !report?.reportID) {
                                    return;
                                }
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                                );
                            }}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowViewTripDetails && (
                    <MenuItem
                        title={translate('travel.viewTripDetails')}
                        icon={Expensicons.Suitcase}
                        onPress={() => {
                            if (!transaction?.transactionID || !report?.reportID) {
                                return;
                            }
                            const reservations = transaction?.receipt?.reservationList?.length ?? 0;
                            if (reservations > 1) {
                                Navigation.navigate(ROUTES.TRAVEL_TRIP_SUMMARY.getRoute(report.reportID, transaction.transactionID, getReportRHPActiveRoute()));
                            }
                            Navigation.navigate(ROUTES.TRAVEL_TRIP_DETAILS.getRoute(report.reportID, transaction.transactionID, 0, getReportRHPActiveRoute()));
                        }}
                    />
                )}
                {shouldShowAttendees && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('attendees')}>
                        <MenuItemWithTopDescription
                            key="attendees"
                            shouldShowRightIcon
                            title={Array.isArray(transactionAttendees) ? transactionAttendees.map((item) => item?.displayName ?? item?.login).join(', ') : ''}
                            description={`${translate('iou.attendees')} ${
                                Array.isArray(transactionAttendees) && transactionAttendees.length > 1 ? `${formattedPerAttendeeAmount} ${translate('common.perPerson')}` : ''
                            }`}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!transaction?.transactionID || !report?.reportID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_ATTENDEE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID));
                            }}
                            interactive
                            shouldRenderAsHTML
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowBillable && (
                    <View style={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}>
                        <View>
                            <Text>{translate('common.billable')}</Text>
                            {!!getErrorForField('billable') && (
                                <ViolationMessages
                                    violations={getViolationsForField('billable')}
                                    containerStyle={[styles.mt1]}
                                    textStyle={[styles.ph0]}
                                    isLast
                                    canEdit={canEdit}
                                />
                            )}
                        </View>
                        <Switch
                            accessibilityLabel={translate('common.billable')}
                            isOn={updatedTransaction?.billable ?? !!transactionBillable}
                            onToggle={saveBillable}
                            disabled={!canEdit}
                        />
                    </View>
                )}
            </>
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

MoneyRequestView.displayName = 'MoneyRequestView';

export default MoneyRequestView;
