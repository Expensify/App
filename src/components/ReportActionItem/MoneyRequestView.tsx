import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePolicyCategories, usePolicyTags} from '@components/OnyxListItemProvider';
import Switch from '@components/Switch';
import Text from '@components/Text';
import ViolationMessages from '@components/ViolationMessages';
import useActiveRoute from '@hooks/useActiveRoute';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import useViolations from '@hooks/useViolations';
import type {ViolationField} from '@hooks/useViolations';
import {getCompanyCardDescription} from '@libs/CardUtils';
import {isCategoryMissing} from '@libs/CategoryUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportIDForExpense} from '@libs/MergeTransactionUtils';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getLengthOfTag, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getReportName,
    getReportOrDraftReport,
    getTransactionDetails,
    getTripIDFromTransactionParentReportID,
    isInvoiceReport,
    isPaidGroupPolicy,
    isReportApproved,
    isReportInGroupPolicy,
    isSettled as isSettledReportUtils,
    isTrackExpenseReport,
} from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {
    getBillable,
    getCurrency,
    getDescription,
    getDistanceInMeters,
    getFormattedCreated,
    getReimbursable,
    getTagForDisplay,
    getTaxName,
    hasMissingSmartscanFields,
    hasReservationList,
    hasRoute as hasRouteTransactionUtils,
    isCardTransaction as isCardTransactionTransactionUtils,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isExpenseSplit,
    isExpenseUnreported as isExpenseUnreportedTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isScanning,
    shouldShowAttendees as shouldShowAttendeesTransactionUtils,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import {updateMoneyRequestBillable, updateMoneyRequestReimbursable} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionPendingFieldsKey} from '@src/types/onyx/Transaction';
import MoneyRequestReceiptView from './MoneyRequestReceiptView';

type MoneyRequestViewProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<OnyxTypes.Report>;

    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Policy that the report belongs to */
    expensePolicy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether we should display the animated banner above the component */
    shouldShowAnimatedBackground: boolean;

    /** Whether we should show Money Request with disabled all fields */
    readonly?: boolean;

    /** whether this report is from review duplicates */
    isFromReviewDuplicates?: boolean;

    /** Updated transaction to show in duplicate & merge transaction flow  */
    updatedTransaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Merge transaction ID to show in merge transaction flow */
    mergeTransactionID?: string;
};

function MoneyRequestView({
    allReports,
    report,
    expensePolicy,
    shouldShowAnimatedBackground,
    readonly = false,
    updatedTransaction,
    isFromReviewDuplicates = false,
    mergeTransactionID,
}: MoneyRequestViewProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const {translate, toLocaleDigit} = useLocalize();
    const {getReportRHPActiveRoute} = useActiveRoute();

    const parentReportID = report?.parentReportID;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        canEvict: false,
        canBeMissing: true,
    });
    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const isFromMergeTransaction = !!mergeTransactionID;
    const linkedTransactionID = useMemo(() => {
        if (!parentReportAction) {
            return undefined;
        }
        const originalMessage = parentReportAction && isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction) : undefined;
        return originalMessage?.IOUTransactionID;
    }, [parentReportAction]);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(linkedTransactionID)}`, {canBeMissing: true});
    const isExpenseUnreported = isExpenseUnreportedTransactionUtils(updatedTransaction ?? transaction);

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        canBeMissing: true,
        selector: (policy) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined),
    });
    // If the expense is unreported the policy should be the user's default policy, otherwise it should be the policy the expense was made for
    const policy = isExpenseUnreported ? activePolicy : expensePolicy;
    const policyID = isExpenseUnreported ? activePolicy?.id : report?.policyID;

    const allPolicyCategories = usePolicyCategories();
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    const transactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${updatedTransaction?.reportID}`];
    const targetPolicyID = updatedTransaction?.reportID ? transactionReport?.policyID : policyID;
    const allPolicyTags = usePolicyTags();
    const policyTagList = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicyID}`];
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});

    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${getNonEmptyStringOnyxID(linkedTransactionID)}`, {canBeMissing: true});
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});

    const originalTransactionIDFromComment = transaction?.comment?.originalTransactionID;
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionIDFromComment ?? ''}`, {canBeMissing: true});

    const {
        created: transactionDate,
        amount: transactionAmount,
        attendees: transactionAttendees,
        taxAmount: transactionTaxAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        reimbursable: transactionReimbursable,
        billable: transactionBillable,
        category: transactionCategory,
        tag: transactionTag,
        originalAmount: transactionOriginalAmount,
        originalCurrency: transactionOriginalCurrency,
        postedDate: transactionPostedDate,
    } = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);
    const isEmptyMerchant = transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isMapDistanceRequest = isDistanceRequest && !isManualDistanceRequest;
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);
    const isTransactionScanning = isScanning(updatedTransaction ?? transaction);
    const hasRoute = hasRouteTransactionUtils(transactionBackup ?? transaction, isDistanceRequest);

    // Use the updated transaction amount in merge flow to have correct positive/negative sign
    const actualAmount = isFromMergeTransaction && updatedTransaction ? updatedTransaction.amount : transactionAmount;
    const actualCurrency = updatedTransaction ? getCurrency(updatedTransaction) : transactionCurrency;
    const shouldDisplayTransactionAmount = ((isDistanceRequest && hasRoute) || !!actualAmount) && actualAmount !== undefined;
    const formattedTransactionAmount = shouldDisplayTransactionAmount ? convertToDisplayString(actualAmount, actualCurrency) : '';
    const formattedPerAttendeeAmount = shouldDisplayTransactionAmount ? convertToDisplayString(actualAmount / (transactionAttendees?.length ?? 1), actualCurrency) : '';

    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isCardTransaction = isCardTransactionTransactionUtils(transaction);
    const cardProgramName = getCompanyCardDescription(transaction?.cardName, transaction?.cardID, cardList);
    const shouldShowCard = isCardTransaction && cardProgramName;

    const moneyRequestReport = parentReport;
    const isApproved = isReportApproved({report: moneyRequestReport});
    const isInvoice = isInvoiceReport(moneyRequestReport);
    const isTrackExpense = isTrackExpenseReport(report);
    const taxRates = policy?.taxRates;
    const formattedTaxAmount = updatedTransaction?.taxAmount
        ? convertToDisplayString(Math.abs(updatedTransaction?.taxAmount), transactionCurrency)
        : convertToDisplayString(Math.abs(transactionTaxAmount ?? 0), transactionCurrency);

    const taxRatesDescription = taxRates?.name;
    const taxRateTitle = updatedTransaction ? getTaxName(policy, updatedTransaction) : getTaxName(policy, transaction);

    const actualTransactionDate = isFromMergeTransaction && updatedTransaction ? getFormattedCreated(updatedTransaction) : transactionDate;
    const fallbackTaxRateTitle = transaction?.taxValue;

    const isSettled = isSettledReportUtils(moneyRequestReport?.reportID);
    const isCancelled = moneyRequestReport && moneyRequestReport?.isCancelledIOU;
    const isChatReportArchived = useReportIsArchived(moneyRequestReport?.chatReportID);
    const shouldShowPaid = isSettled && transactionReimbursable;

    // Flags for allowing or disallowing editing an expense
    // Used for non-restricted fields such as: description, category, tag, billable, etc...
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isEditable = !!canUserPerformWriteActionReportUtils(report, isReportArchived) && !readonly;
    const canEdit = isMoneyRequestAction(parentReportAction) && canEditMoneyRequest(parentReportAction, transaction, isChatReportArchived) && isEditable;

    const canEditTaxFields = canEdit && !isDistanceRequest;
    const canEditAmount = isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT, undefined, isChatReportArchived);
    const canEditMerchant = isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.MERCHANT, undefined, isChatReportArchived);
    const canEditDate = isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DATE, undefined, isChatReportArchived);
    const canEditDistance = isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DISTANCE, undefined, isChatReportArchived);
    const canEditDistanceRate = isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DISTANCE_RATE, undefined, isChatReportArchived);
    const canEditReport = useMemo(
        () => isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, isChatReportArchived, outstandingReportsByPolicyID),
        [isEditable, parentReportAction, isChatReportArchived, outstandingReportsByPolicyID],
    );

    // A flag for verifying that the current report is a sub-report of a expense chat
    // if the policy of the report is either Collect or Control, then this report must be tied to expense chat
    const isPolicyExpenseChat = isReportInGroupPolicy(report);

    const shouldShowPolicySpecificFields = isPolicyExpenseChat || isExpenseUnreported;

    const policyTagLists = useMemo(() => getTagLists(policyTagList), [policyTagList]);

    const iouType = useMemo(() => {
        if (isTrackExpense) {
            return CONST.IOU.TYPE.TRACK;
        }
        if (isInvoice) {
            return CONST.IOU.TYPE.INVOICE;
        }

        return CONST.IOU.TYPE.SUBMIT;
    }, [isTrackExpense, isInvoice]);

    const category = transactionCategory ?? '';
    const categoryForDisplay = isCategoryMissing(category) ? '' : category;

    // Flags for showing categories and tags
    // transactionCategory can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowCategory = shouldShowPolicySpecificFields && (categoryForDisplay || hasEnabledOptions(policyCategories ?? {}));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowTag = shouldShowPolicySpecificFields && (transactionTag || hasEnabledTags(policyTagLists));
    const shouldShowBillable = shouldShowPolicySpecificFields && (!!transactionBillable || !(policy?.disabledFields?.defaultBillable ?? true) || !!updatedTransaction?.billable);
    const isCurrentTransactionReimbursableDifferentFromPolicyDefault =
        policy?.defaultReimbursable !== undefined && !!(updatedTransaction?.reimbursable ?? transactionReimbursable) !== policy.defaultReimbursable;
    const shouldShowReimbursable =
        isPolicyExpenseChat && (!policy?.disabledFields?.reimbursable || isCurrentTransactionReimbursableDifferentFromPolicyDefault) && !isCardTransaction && !isInvoice;
    const canEditReimbursable = isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.REIMBURSABLE, undefined, isChatReportArchived);
    const shouldShowAttendees = useMemo(() => shouldShowAttendeesTransactionUtils(iouType, policy), [iouType, policy]);

    const shouldShowTax = isTaxTrackingEnabled(shouldShowPolicySpecificFields, policy, isDistanceRequest, isPerDiemRequest);
    const tripID = getTripIDFromTransactionParentReportID(parentReport?.parentReportID);
    const shouldShowViewTripDetails = hasReservationList(transaction) && !!tripID;

    const {getViolationsForField} = useViolations(transactionViolations ?? [], isTransactionScanning || !isPaidGroupPolicy(report));
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
    const isCustomUnitOutOfPolicy = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY) || (isDistanceRequest && !rate);
    const rateToDisplay = isCustomUnitOutOfPolicy ? translate('common.rateOutOfPolicy') : DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline);
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate);
    let merchantTitle = isEmptyMerchant ? '' : transactionMerchant;
    let amountTitle = formattedTransactionAmount ? formattedTransactionAmount.toString() : '';
    if (isTransactionScanning) {
        merchantTitle = translate('iou.receiptStatusTitle');
        amountTitle = translate('iou.receiptStatusTitle');
    }

    const updatedTransactionDescription = useMemo(() => {
        if (!updatedTransaction) {
            return undefined;
        }
        return getDescription(updatedTransaction ?? null);
    }, [updatedTransaction]);
    const isEmptyUpdatedMerchant = updatedTransaction?.modifiedMerchant === '' || updatedTransaction?.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const updatedMerchantTitle = isEmptyUpdatedMerchant ? '' : (updatedTransaction?.modifiedMerchant ?? merchantTitle);

    const saveBillable = useCallback(
        (newBillable: boolean) => {
            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newBillable === getBillable(transaction) || !transaction?.transactionID || !report?.reportID) {
                return;
            }
            updateMoneyRequestBillable(transaction.transactionID, report?.reportID, newBillable, policy, policyTagList, policyCategories);
        },
        [transaction, report?.reportID, policy, policyTagList, policyCategories],
    );

    const saveReimbursable = useCallback(
        (newReimbursable: boolean) => {
            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newReimbursable === getReimbursable(transaction) || !transaction?.transactionID || !report?.reportID) {
                return;
            }
            updateMoneyRequestReimbursable(transaction.transactionID, report?.reportID, newReimbursable, policy, policyTagList, policyCategories);
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
        if (isExpenseSplit(transaction, originalTransaction)) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.split')}`;
        }
        if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        }
    } else {
        if (!isDistanceRequest && !isPerDiemRequest) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.cash')}`;
        }
        if (isExpenseSplit(transaction, originalTransaction)) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.split')}`;
        }
        if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        } else if (isApproved) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
        } else if (shouldShowPaid) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.settledExpensify')}`;
        }
    }

    const hasErrors = hasMissingSmartscanFields(transaction);
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

            if (isCustomUnitOutOfPolicy && field === 'customUnitRateID') {
                return translate('violations.customUnitOutOfPolicy');
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
            isCustomUnitOutOfPolicy,
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

                        if (isManualDistanceRequest) {
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                            );
                            return;
                        }

                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()),
                        );
                    }}
                    copyValue={!canEditDistance ? distanceToDisplay : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={getPendingFieldAction('customUnitRateID')}>
                <MenuItemWithTopDescription
                    description={translate('common.rate')}
                    title={rateToDisplay}
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
                    copyValue={!canEditDistanceRate ? rateToDisplay : undefined}
                />
            </OfflineWithFeedback>
        </>
    );

    // Whether to show receipt audit result (e.g.`Verified`, `Issue Found`) and messages (e.g. `Receipt not verified. Please confirm accuracy.`)
    // `!!(receiptViolations.length || didReceiptScanSucceed)` is for not showing `Verified` when `receiptViolations` is empty and `didReceiptScanSucceed` is false.

    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTagList);

    const previousTransactionTag = usePrevious(transactionTag);

    const [previousTag, setPreviousTag] = useState<string | undefined>(undefined);
    const [currentTransactionTag, setCurrentTransactionTag] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (transactionTag === previousTransactionTag) {
            return;
        }
        setPreviousTag(previousTransactionTag);
        setCurrentTransactionTag(transactionTag);
    }, [transactionTag, previousTransactionTag]);

    const previousTagLength = getLengthOfTag(previousTag ?? '');
    const currentTagLength = getLengthOfTag(currentTransactionTag ?? '');

    const tagList = policyTagLists.map(({name, orderWeight, tags}, index) => {
        const tagForDisplay = getTagForDisplay(updatedTransaction ?? transaction, index);
        let shouldShow = false;
        if (hasDependentTags) {
            if (index === 0) {
                shouldShow = true;
            } else {
                const prevTagValue = getTagForDisplay(transaction, index - 1);
                shouldShow = !!prevTagValue;
            }
        } else {
            shouldShow = !!tagForDisplay || hasEnabledOptions(tags);
        }

        if (!shouldShow) {
            return null;
        }

        const tagError = getErrorForField(
            'tag',
            {
                tagListIndex: index,
                tagListName: name,
            },
            hasDependentTags,
            tagForDisplay,
        );

        return (
            <OfflineWithFeedback
                key={name}
                pendingAction={getPendingFieldAction('tag')}
            >
                <MenuItemWithTopDescription
                    highlighted={hasDependentTags && shouldShow && !getTagForDisplay(transaction, index) && currentTagLength > previousTagLength}
                    description={name ?? translate('common.tag')}
                    title={tagForDisplay}
                    numberOfLinesTitle={2}
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
                    shouldShowBasicTitle
                    shouldShowDescriptionOnTop
                />
            </OfflineWithFeedback>
        );
    });

    const actualParentReport = isFromMergeTransaction ? getReportOrDraftReport(getReportIDForExpense(updatedTransaction)) : parentReport;
    const shouldShowReport = !!parentReportID || !!actualParentReport;

    return (
        <View style={styles.pRelative}>
            {shouldShowAnimatedBackground && <AnimatedEmptyStateBackground />}
            <>
                <MoneyRequestReceiptView
                    allReports={allReports}
                    report={report}
                    readonly={readonly}
                    updatedTransaction={updatedTransaction}
                    isFromReviewDuplicates={isFromReviewDuplicates}
                    mergeTransactionID={mergeTransactionID}
                />
                {isCustomUnitOutOfPolicy && isPerDiemRequest && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.mh4, styles.mb2]}>
                        <Icon
                            src={Expensicons.DotIndicator}
                            fill={theme.danger}
                            height={16}
                            width={16}
                        />
                        <Text
                            numberOfLines={1}
                            style={[StyleUtils.getDotIndicatorTextStyles(true), styles.pre, styles.flexShrink1]}
                        >
                            {translate('violations.customUnitOutOfPolicy')}
                        </Text>
                    </View>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('amount') ?? (amountTitle ? getPendingFieldAction('customUnitRateID') : undefined)}>
                    <MenuItemWithTopDescription
                        title={amountTitle}
                        shouldShowTitleIcon={shouldShowPaid}
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
                                ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, '', '', getReportRHPActiveRoute()),
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
                {isManualDistanceRequest || (isMapDistanceRequest && transaction?.comment?.waypoints) ? (
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
                            copyValue={!canEditMerchant ? updatedMerchantTitle : undefined}
                        />
                    </OfflineWithFeedback>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('created')}>
                    <MenuItemWithTopDescription
                        description={dateDescription}
                        title={actualTransactionDate}
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
                        copyValue={!canEditDate ? transactionDate : undefined}
                    />
                </OfflineWithFeedback>
                {!!shouldShowCategory && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('category')}>
                        <MenuItemWithTopDescription
                            description={translate('common.category')}
                            title={updatedTransaction?.category ?? categoryForDisplay}
                            numberOfLinesTitle={2}
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
                            title={taxRateTitle ?? fallbackTaxRateTitle}
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
                {shouldShowAttendees && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('attendees')}>
                        <MenuItemWithTopDescription
                            key="attendees"
                            title={Array.isArray(transactionAttendees) ? transactionAttendees.map((item) => item?.displayName ?? item?.login).join(', ') : ''}
                            description={`${translate('iou.attendees')} ${
                                Array.isArray(transactionAttendees) && transactionAttendees.length > 1 && formattedPerAttendeeAmount
                                    ? `${CONST.DOT_SEPARATOR} ${formattedPerAttendeeAmount} ${translate('common.perPerson')}`
                                    : ''
                            }`}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!transaction?.transactionID || !report?.reportID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_ATTENDEE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID));
                            }}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            shouldRenderAsHTML
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowReimbursable && (
                    <OfflineWithFeedback
                        pendingAction={getPendingFieldAction('reimbursable')}
                        contentContainerStyle={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}
                    >
                        <View>
                            <Text>{Str.UCFirst(translate('iou.reimbursable'))}</Text>
                        </View>
                        <Switch
                            accessibilityLabel={Str.UCFirst(translate('iou.reimbursable'))}
                            isOn={updatedTransaction?.reimbursable ?? !!transactionReimbursable}
                            onToggle={saveReimbursable}
                            disabled={!canEditReimbursable}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowBillable && (
                    <OfflineWithFeedback
                        pendingAction={getPendingFieldAction('billable')}
                        contentContainerStyle={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}
                    >
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
                    </OfflineWithFeedback>
                )}
                {shouldShowReport && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('reportID')}>
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={canEditReport}
                            title={getReportName(actualParentReport) || actualParentReport?.reportName}
                            description={translate('common.report')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!canEditReport || !report?.reportID || !transaction?.transactionID) {
                                    return;
                                }
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID, report.reportID, getReportRHPActiveRoute()),
                                );
                            }}
                            interactive={canEditReport}
                            shouldRenderAsHTML
                        />
                    </OfflineWithFeedback>
                )}
                {/* Note: "View trip details" should be always the last item */}
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
                            Navigation.navigate(ROUTES.TRAVEL_TRIP_DETAILS.getRoute(report.reportID, transaction.transactionID, '0', 0, getReportRHPActiveRoute()));
                        }}
                    />
                )}
            </>
        </View>
    );
}

MoneyRequestView.displayName = 'MoneyRequestView';

export default MoneyRequestView;
