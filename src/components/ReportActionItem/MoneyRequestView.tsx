import {Str} from 'expensify-common';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePolicyCategories, usePolicyTags} from '@components/OnyxListItemProvider';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import {useSearchContext} from '@components/Search/SearchContext';
import Switch from '@components/Switch';
import Text from '@components/Text';
import ViolationMessages from '@components/ViolationMessages';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useActiveRoute from '@hooks/useActiveRoute';
import useCurrencyList from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import type {ViolationField} from '@hooks/useViolations';
import useViolations from '@hooks/useViolations';
import {initSplitExpense, updateMoneyRequestBillable, updateMoneyRequestReimbursable} from '@libs/actions/IOU/index';
import {getIsMissingAttendeesViolation} from '@libs/AttendeeUtils';
import {filterPersonalCards, getCompanyCardDescription, mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getDecodedCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getRateFromMerchant} from '@libs/MergeTransactionUtils';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {
    canSubmitPerDiemExpenseFromWorkspace,
    getLengthOfTag,
    getPerDiemCustomUnit,
    getPolicyByCustomUnitID,
    getTagLists,
    hasDependentTags as hasDependentTagsPolicyUtils,
    isPolicyAccessible,
    isTaxTrackingEnabled,
} from '@libs/PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getReportName,
    getTransactionDetails,
    getTripIDFromTransactionParentReportID,
    isExpenseReport,
    isInvoiceReport,
    isPaidGroupPolicy,
    isReportApproved,
    isReportInGroupPolicy,
    isSettled as isSettledReportUtils,
    isTrackExpenseReportNew,
    shouldEnableNegative,
} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {
    getBillable,
    getCurrency,
    getDescription,
    getDistanceInMeters,
    getFormattedCreated,
    getOriginalAmountForDisplay,
    getOriginalTransactionWithSplitInfo,
    getReimbursable,
    getTagArrayFromName,
    getTagForDisplay,
    getTaxName,
    hasMissingSmartscanFields,
    hasReservationList,
    hasRoute as hasRouteTransactionUtils,
    isFromCreditCardImport as isCardTransactionTransactionUtils,
    isCategoryBeingAnalyzed,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isExpenseUnreported as isExpenseUnreportedTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isScanning,
    isTimeRequest as isTimeRequestTransactionUtils,
    shouldShowAttendees as shouldShowAttendeesTransactionUtils,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionPendingFieldsKey} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MoneyRequestReceiptView from './MoneyRequestReceiptView';

type MoneyRequestViewProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<OnyxTypes.Report>;

    /** The report currently being looked at */
    transactionThreadReport?: OnyxEntry<OnyxTypes.Report>;

    parentReportID?: string;

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

const perDiemPoliciesSelector = (policies: OnyxCollection<OnyxTypes.Policy>) => {
    return Object.fromEntries(
        Object.entries(policies ?? {}).filter(([, policy]) => {
            const perDiemCustomUnit = getPerDiemCustomUnit(policy);
            const hasPolicyPerDiemRates = !isEmptyObject(perDiemCustomUnit?.rates);

            return policy?.arePerDiemRatesEnabled && hasPolicyPerDiemRates;
        }),
    );
};

function MoneyRequestView({
    allReports,
    transactionThreadReport,
    parentReportID,
    expensePolicy,
    shouldShowAnimatedBackground,
    readonly = false,
    updatedTransaction,
    isFromReviewDuplicates = false,
    mergeTransactionID,
}: MoneyRequestViewProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Checkmark', 'Suitcase']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const {environmentURL} = useEnvironment();
    const {translate, toLocaleDigit, preferredLocale} = useLocalize();
    const {getCurrencySymbol} = useCurrencyList();
    const {getReportRHPActiveRoute} = useActiveRoute();
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH, {canBeMissing: true});

    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});

    const {currentSearchResults} = useSearchContext();

    // When this component is used when merging from the search page, we might not have the parent report stored in the main collection
    let [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {canBeMissing: true});
    parentReport = parentReport ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(parentReport?.reportID)}`, {canBeMissing: true});

    const parentReportActionSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>) =>
        transactionThreadReport?.parentReportActionID ? reportActions?.[transactionThreadReport.parentReportActionID] : undefined;

    // The parentReportActionSelector is memoized by React Compiler
    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        canEvict: false,
        canBeMissing: true,
        selector: parentReportActionSelector,
    });

    const isFromMergeTransaction = !!mergeTransactionID;
    const linkedTransactionID = parentReportAction && isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;
    let [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(linkedTransactionID)}`, {canBeMissing: true});
    if (updatedTransaction) {
        transaction = updatedTransaction;
    }
    const isExpenseUnreported = isExpenseUnreportedTransactionUtils(transaction);
    const {policyForMovingExpensesID, policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const isTimeRequest = isTimeRequestTransactionUtils(transaction);

    const [policiesWithPerDiem] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: perDiemPoliciesSelector,
        canBeMissing: true,
    });
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);
    const perDiemOriginalPolicy = getPolicyByCustomUnitID(transaction, policiesWithPerDiem);

    let policy;
    let policyID;
    // If the expense is unreported the policy should be the user's default policy, if the expense is a per diem request and is unreported
    // the policy should be the one where the per diem rates are enabled, otherwise it should be the expense's report policy
    if (isExpenseUnreported && !isPerDiemRequest) {
        policy = policyForMovingExpenses;
        policyID = policyForMovingExpensesID;
    } else if (isExpenseUnreported && isPerDiemRequest) {
        policy = perDiemOriginalPolicy;
        policyID = perDiemOriginalPolicy?.id;
    } else {
        policy = expensePolicy;
        policyID = parentReport?.policyID;
    }

    const allPolicyCategories = usePolicyCategories();
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    const targetPolicyID = updatedTransaction?.reportID ? parentReport?.policyID : policyID;
    const allPolicyTags = usePolicyTags();
    const policyTagList = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicyID}`];
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});
    const [companyCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(companyCardList ?? CONST.EMPTY_OBJECT, cardList), [companyCardList, cardList]);

    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${getNonEmptyStringOnyxID(linkedTransactionID)}`, {canBeMissing: true});
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isZeroExpensesBetaEnabled = isBetaEnabled(CONST.BETAS.ZERO_EXPENSES);

    const moneyRequestReport = parentReport;
    const isApproved = isReportApproved({report: moneyRequestReport});
    const isInvoice = isInvoiceReport(moneyRequestReport);
    const isTrackExpense = !mergeTransactionID && isTrackExpenseReportNew(transactionThreadReport, moneyRequestReport, parentReportAction);

    const iouType = useMemo(() => {
        if (isTrackExpense) {
            return CONST.IOU.TYPE.TRACK;
        }
        if (isInvoice) {
            return CONST.IOU.TYPE.INVOICE;
        }

        return CONST.IOU.TYPE.SUBMIT;
    }, [isTrackExpense, isInvoice]);

    const allowNegativeAmount = shouldEnableNegative(parentReport, policy, iouType);

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
        originalCurrency: transactionOriginalCurrency,
        postedDate: transactionPostedDate,
        convertedAmount: transactionConvertedAmount,
    } = getTransactionDetails(transaction, undefined, undefined, allowNegativeAmount, false, currentUserPersonalDetails, preferredLocale) ?? {};
    const isZeroTransactionAmount = transactionAmount === 0;
    const isEmptyMerchant =
        transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || transactionMerchant === CONST.TRANSACTION.DEFAULT_MERCHANT;
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction, !!mergeTransactionID);
    const isOdometerDistanceRequest = isOdometerDistanceRequestTransactionUtils(transaction);
    const isMapDistanceRequest = isDistanceRequest && !isManualDistanceRequest;
    const isTransactionScanning = isScanning(updatedTransaction ?? transaction);
    const hasRoute = hasRouteTransactionUtils(transactionBackup ?? transaction, isDistanceRequest);

    const actualAttendees = isFromMergeTransaction && updatedTransaction ? updatedTransaction.comment?.attendees : transactionAttendees;

    // Use the updated transaction amount in merge flow to have correct positive/negative sign
    const actualAmount = isFromMergeTransaction && updatedTransaction ? updatedTransaction.amount : transactionAmount;
    const actualCurrency = updatedTransaction ? getCurrency(updatedTransaction) : transactionCurrency;
    const shouldDisplayTransactionAmount = (isDistanceRequest && hasRoute) || !isDistanceRequest;
    const formattedTransactionAmount = shouldDisplayTransactionAmount ? convertToDisplayString(actualAmount, actualCurrency) : '';
    const formattedPerAttendeeAmount =
        shouldDisplayTransactionAmount && actualAmount !== undefined ? convertToDisplayString(actualAmount / (transactionAttendees?.length ?? 1), actualCurrency) : '';

    const transactionOriginalAmount = transaction && getOriginalAmountForDisplay(transaction, isExpenseReport(moneyRequestReport));
    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isManagedCardTransaction = isCardTransactionTransactionUtils(transaction);
    const cardProgramName = getCompanyCardDescription(transaction?.cardName, transaction?.cardID, allCards);
    const shouldShowCard = isManagedCardTransaction && cardProgramName;

    const taxRates = policy?.taxRates;
    const formattedTaxAmount = updatedTransaction?.taxAmount
        ? convertToDisplayString(Math.abs(updatedTransaction?.taxAmount), transactionCurrency)
        : convertToDisplayString(Math.abs(transactionTaxAmount ?? 0), transactionCurrency);

    const taxRatesDescription = taxRates?.name;
    const taxRateTitle = updatedTransaction ? getTaxName(policy, updatedTransaction) : getTaxName(policy, transaction);

    const actualTransactionDate = isFromMergeTransaction && updatedTransaction ? getFormattedCreated(updatedTransaction, preferredLocale) : transactionDate;
    const fallbackTaxRateTitle = transaction?.taxValue;

    const isSettled = isSettledReportUtils(moneyRequestReport);
    const isCancelled = moneyRequestReport && moneyRequestReport?.isCancelledIOU;
    const isChatReportArchived = useReportIsArchived(moneyRequestReport?.chatReportID);
    const pendingAction = transaction?.pendingAction;
    const shouldShowPaid = isSettled && transactionReimbursable && !pendingAction;

    // Flags for allowing or disallowing editing an expense
    // Used for non-restricted fields such as: description, category, tag, billable, etc...
    const isReportArchived = useReportIsArchived(transactionThreadReport?.reportID);
    const isEditable = !!canUserPerformWriteActionReportUtils(transactionThreadReport, isReportArchived) && !readonly;
    const canEdit = isMoneyRequestAction(parentReportAction) && canEditMoneyRequest(parentReportAction, isChatReportArchived, moneyRequestReport, policy, transaction) && isEditable;
    const companyCardPageURL = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(transactionThreadReport?.policyID)}`;
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`, {canBeMissing: true});
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`, {canBeMissing: true});
    const isSplitAvailable = moneyRequestReport && transaction && isSplitAction(moneyRequestReport, [transaction], originalTransaction, currentUserPersonalDetails.login ?? '', policy);

    const canEditTaxFields = canEdit && !isDistanceRequest;
    const canEditAmount =
        isEditable && (canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT, undefined, isChatReportArchived) || (isExpenseSplit && isSplitAvailable));
    const canEditMerchant =
        isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.MERCHANT, undefined, isChatReportArchived, undefined, transaction, moneyRequestReport, policy);

    const canEditDate =
        isEditable && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DATE, undefined, isChatReportArchived, undefined, transaction, moneyRequestReport, policy);

    const canEditDistance =
        isEditable &&
        canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DISTANCE, undefined, isChatReportArchived, undefined, transaction, moneyRequestReport, policy) &&
        isPolicyAccessible(policy, currentUserEmailParam);

    const canEditDistanceRate =
        isEditable &&
        canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DISTANCE_RATE, undefined, isChatReportArchived, undefined, transaction, moneyRequestReport, policy) &&
        isPolicyAccessible(policy, currentUserEmailParam);

    const canEditReport =
        isEditable &&
        canEditFieldOfMoneyRequest(
            parentReportAction,
            CONST.EDIT_REQUEST_FIELD.REPORT,
            undefined,
            isChatReportArchived,
            outstandingReportsByPolicyID,
            transaction,
            moneyRequestReport,
            policy,
        ) &&
        (!isPerDiemRequest || canSubmitPerDiemExpenseFromWorkspace(policy) || (isExpenseUnreported && !!perDiemOriginalPolicy));

    // A flag for verifying that the current report is a sub-report of a expense chat
    // if the policy of the report is either Collect or Control, then this report must be tied to expense chat
    const isPolicyExpenseChat = isReportInGroupPolicy(moneyRequestReport);
    const policyTagLists = getTagLists(policyTagList);

    const category = transactionCategory ?? '';
    const categoryForDisplay = isCategoryMissing(category) ? '' : category;

    // Flags for showing categories and tags
    // transactionCategory can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowCategory =
        (isPolicyExpenseChat && (categoryForDisplay || hasEnabledOptions(policyCategories ?? {}))) ||
        (isExpenseUnreported && (!policyForMovingExpenses || hasEnabledOptions(policyCategories ?? {})));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowTag = (isPolicyExpenseChat || isExpenseUnreported) && (transactionTag || (canEdit && hasEnabledTags(policyTagLists)));
    const shouldShowBillable =
        (isPolicyExpenseChat || isExpenseUnreported) && (!!transactionBillable || !(policy?.disabledFields?.defaultBillable ?? true) || !!updatedTransaction?.billable);
    const isCurrentTransactionReimbursableDifferentFromPolicyDefault =
        policy?.defaultReimbursable !== undefined && !!(updatedTransaction?.reimbursable ?? transactionReimbursable) !== policy.defaultReimbursable;
    const shouldShowReimbursable =
        (isPolicyExpenseChat || isExpenseUnreported) &&
        (policy?.disabledFields?.reimbursable !== true || isCurrentTransactionReimbursableDifferentFromPolicyDefault) &&
        !isManagedCardTransaction &&
        !isInvoice;
    const canEditReimbursable =
        isEditable &&
        canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.REIMBURSABLE, undefined, isChatReportArchived, undefined, transaction, moneyRequestReport, policy);
    const shouldShowAttendees = shouldShowAttendeesTransactionUtils(iouType, policy);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest);
    const tripID = getTripIDFromTransactionParentReportID(parentReport?.parentReportID);
    const shouldShowViewTripDetails = hasReservationList(transaction) && !!tripID;

    const {getViolationsForField} = useViolations(transactionViolations ?? [], isTransactionScanning || !isPaidGroupPolicy(transactionThreadReport));
    const hasViolations = useCallback(
        (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string): boolean =>
            getViolationsForField(field, data, policyHasDependentTags, tagValue).length > 0,
        [getViolationsForField],
    );
    // Need to return undefined when we have pendingAction to avoid the duplicate pending action
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => (pendingAction ? undefined : transaction?.pendingFields?.[fieldPath]);

    let amountDescription = `${translate('iou.amount')}`;
    let dateDescription = `${translate('common.date')}`;

    const {unit, rate} = DistanceRequestUtils.getRate({transaction: updatedTransaction ?? transaction, policy});
    const distance = getDistanceInMeters(transactionBackup ?? updatedTransaction ?? transaction, unit);
    const currency = transactionCurrency ?? CONST.CURRENCY.USD;
    const hasRequiredCompanyCardViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.COMPANY_CARD_REQUIRED);
    const isCustomUnitOutOfPolicy = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY) || (isDistanceRequest && !rate);
    let rateToDisplay = isCustomUnitOutOfPolicy
        ? translate('common.rateOutOfPolicy')
        : DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, getCurrencySymbol, isOffline);
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate);
    let merchantTitle = isEmptyMerchant ? '' : transactionMerchant;
    let amountTitle = formattedTransactionAmount?.toString() || '';
    if (isTransactionScanning) {
        merchantTitle = translate('iou.receiptStatusTitle');
        amountTitle = translate('iou.receiptStatusTitle');
    }

    const shouldNavigateToUpgradePath = !policyForMovingExpenses && !shouldSelectPolicy;
    const updatedTransactionDescription = getDescription(updatedTransaction) || undefined;
    const isEmptyUpdatedMerchant =
        updatedTransaction?.modifiedMerchant === '' ||
        updatedTransaction?.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ||
        updatedTransaction?.modifiedMerchant === CONST.TRANSACTION.DEFAULT_MERCHANT;
    const updatedMerchantTitle = isEmptyUpdatedMerchant ? '' : (updatedTransaction?.modifiedMerchant ?? merchantTitle);

    const shouldShowConvertedAmount =
        transactionConvertedAmount &&
        currency !== moneyRequestReport?.currency &&
        !isManagedCardTransaction &&
        transaction?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID &&
        !isFromMergeTransaction &&
        !isFromReviewDuplicates &&
        !getPendingFieldAction('amount') &&
        !pendingAction;

    const saveBillable = (newBillable: boolean) => {
        // If the value hasn't changed, don't request to save changes on the server and just close the modal
        if (newBillable === getBillable(transaction) || !transaction?.transactionID || !transactionThreadReport?.reportID) {
            return;
        }
        updateMoneyRequestBillable({
            transactionID: transaction.transactionID,
            transactionThreadReport,
            parentReport,
            value: newBillable,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            parentReportNextStep,
        });
    };

    const saveReimbursable = (newReimbursable: boolean) => {
        // If the value hasn't changed, don't request to save changes on the server and just close the modal
        if (newReimbursable === getReimbursable(transaction) || !transaction?.transactionID || !transactionThreadReport?.reportID) {
            return;
        }
        updateMoneyRequestReimbursable({
            transactionID: transaction.transactionID,
            transactionThreadReport,
            parentReport,
            value: newReimbursable,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            parentReportNextStep,
        });
    };

    if (isManagedCardTransaction) {
        if (transactionPostedDate) {
            dateDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.posted')} ${transactionPostedDate}`;
        }
        if (formattedOriginalAmount) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.original')} ${formattedOriginalAmount}`;
        }
        if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        }
    } else if (isCancelled) {
        amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
    } else if (isApproved) {
        amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
    } else if (shouldShowPaid) {
        amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.settledExpensify')}`;
    }
    if (isExpenseSplit) {
        amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.split')}`;
    }
    if (shouldShowConvertedAmount) {
        amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('common.converted')} ${convertToDisplayString(transactionConvertedAmount, moneyRequestReport?.currency)}`;
    }

    if (isFromMergeTransaction) {
        // Because we lack the necessary data in policy.customUnits to determine the rate in merge flow,
        // We need to extract the rate from the merchant string
        // See https://github.com/Expensify/App/pull/71675#issuecomment-3425488228 for more information
        rateToDisplay = getRateFromMerchant(updatedMerchantTitle);
    }

    const hasErrors = hasMissingSmartscanFields(transaction, transactionReport);
    const isMissingAttendeesViolation = getIsMissingAttendeesViolation(
        policyCategories,
        updatedTransaction?.category ?? categoryForDisplay,
        actualAttendees,
        currentUserPersonalDetails,
        policy?.isAttendeeTrackingEnabled,
    );

    const getErrorForField = (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string) => {
        // Checks applied when creating a new expense
        // NOTE: receipt field can return multiple violations, so we need to handle it separately
        const fieldChecks: Partial<Record<ViolationField, {isError: boolean; translationPath: TranslationPaths}>> = {
            amount: {
                isError: isZeroTransactionAmount && !isZeroExpensesBetaEnabled,
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
            return `${violations.map((violation) => ViolationsUtils.getViolationTranslation(violation, translate, canEdit, undefined, companyCardPageURL)).join('. ')}.`;
        }

        if (field === 'attendees' && isMissingAttendeesViolation) {
            return translate('violations.missingAttendees');
        }

        return '';
    };

    const distanceCopyValue = !canEditDistance ? distanceToDisplay : undefined;
    const distanceRateCopyValue = !canEditDistanceRate ? rateToDisplay : undefined;
    const amountCopyValue = !canEditAmount ? amountTitle : undefined;
    const descriptionHTML = updatedTransactionDescription ?? transactionDescription;
    const descriptionCopyValue = !canEdit && descriptionHTML ? Parser.htmlToText(descriptionHTML) : undefined;
    const merchantCopyValue = !canEditMerchant ? updatedMerchantTitle : undefined;
    const dateCopyValue = !canEditDate ? transactionDate : undefined;
    const categoryValue = updatedTransaction?.category ?? categoryForDisplay;
    const decodedCategoryName = getDecodedCategoryName(categoryValue);
    const categoryCopyValue = !canEdit ? decodedCategoryName : undefined;
    const cardCopyValue = cardProgramName;
    const taxRateValue = taxRateTitle ?? fallbackTaxRateTitle;
    const taxRateCopyValue = !canEditTaxFields ? taxRateValue : undefined;
    const taxAmountTitle = formattedTaxAmount ? formattedTaxAmount.toString() : '';
    const taxAmountCopyValue = !canEditTaxFields ? taxAmountTitle : undefined;

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
                        if (!transaction?.transactionID || !transactionThreadReport?.reportID) {
                            return;
                        }

                        if (isExpenseSplit && isSplitAvailable) {
                            initSplitExpense(allTransactions, allReports, transaction);
                            return;
                        }

                        if (isOdometerDistanceRequest) {
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport.reportID),
                            );
                            return;
                        }

                        if (isManualDistanceRequest) {
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.getRoute(
                                    CONST.IOU.ACTION.EDIT,
                                    iouType,
                                    transaction.transactionID,
                                    transactionThreadReport.reportID,
                                    getReportRHPActiveRoute(),
                                ),
                            );
                            return;
                        }

                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(
                                CONST.IOU.ACTION.EDIT,
                                iouType,
                                transaction.transactionID,
                                transactionThreadReport.reportID,
                                getReportRHPActiveRoute(),
                            ),
                        );
                    }}
                    brickRoadIndicator={getErrorForField('waypoints') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={getErrorForField('waypoints')}
                    copyValue={distanceCopyValue}
                    copyable={!!distanceCopyValue}
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
                        if (!transaction?.transactionID || !transactionThreadReport?.reportID) {
                            return;
                        }

                        if (isExpenseSplit && isSplitAvailable) {
                            initSplitExpense(allTransactions, allReports, transaction);
                            return;
                        }

                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(
                                CONST.IOU.ACTION.EDIT,
                                iouType,
                                transaction.transactionID,
                                transactionThreadReport.reportID,
                                getReportRHPActiveRoute(),
                            ),
                        );
                    }}
                    brickRoadIndicator={getErrorForField('customUnitRateID') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={getErrorForField('customUnitRateID')}
                    copyValue={distanceRateCopyValue}
                    copyable={!!distanceRateCopyValue}
                />
            </OfflineWithFeedback>
        </>
    );

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

    const getAttendeesTitle = Array.isArray(actualAttendees) ? actualAttendees.map((item) => item?.displayName ?? item?.login).join(', ') : '';
    const attendeesCopyValue = !canEdit ? getAttendeesTitle : undefined;

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
                if (!prevTagValue) {
                    shouldShow = false;
                } else {
                    const parentTag = getTagArrayFromName(transactionTag ?? '')
                        .slice(0, index)
                        .join(':');

                    const availableTags = Object.values(tags).filter((policyTag) => {
                        const filterRegex = policyTag.rules?.parentTagsFilter;
                        if (!filterRegex) {
                            return true;
                        }

                        const regex = new RegExp(filterRegex);
                        return regex.test(parentTag ?? '');
                    });

                    shouldShow = availableTags.some((tag) => tag.enabled);
                }
            }
        } else {
            shouldShow = !!tagForDisplay || (canEdit && hasEnabledOptions(tags));
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
        const tagCopyValue = !canEdit ? tagForDisplay : undefined;

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
                        if (!transaction?.transactionID || !transactionThreadReport?.reportID) {
                            return;
                        }
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(
                                CONST.IOU.ACTION.EDIT,
                                iouType,
                                orderWeight,
                                transaction.transactionID,
                                transactionThreadReport.reportID,
                                getReportRHPActiveRoute(),
                            ),
                        );
                    }}
                    brickRoadIndicator={tagError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={tagError}
                    shouldShowBasicTitle
                    shouldShowDescriptionOnTop
                    copyValue={tagCopyValue}
                    copyable={!!tagCopyValue}
                />
            </OfflineWithFeedback>
        );
    });

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const reportNameToDisplay = isFromMergeTransaction ? (updatedTransaction?.reportName ?? translate('common.none')) : getReportName(parentReport) || parentReport?.reportName;
    const shouldShowReport = !!parentReportID || (isFromMergeTransaction && !!reportNameToDisplay);
    const reportCopyValue = !canEditReport && reportNameToDisplay !== translate('common.none') ? reportNameToDisplay : undefined;
    const shouldShowCategoryAnalyzing = isCategoryBeingAnalyzed(updatedTransaction ?? transaction);

    // In this case we want to use this value. The shouldUseNarrowLayout will always be true as this case is handled when we display ReportScreen in RHP.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys} = useContext(WideRHPContext);

    // If the view is readonly, we don't need the transactionThread dependency
    if ((!readonly && !transactionThreadReport?.reportID) || !transaction?.transactionID) {
        return <ReportActionsSkeletonView />;
    }

    return (
        <View style={[styles.moneyRequestView]}>
            {shouldShowAnimatedBackground && <AnimatedEmptyStateBackground />}
            <>
                {(wideRHPRouteKeys.length === 0 || isSmallScreenWidth || isFromReviewDuplicates || isFromMergeTransaction) && (
                    <MoneyRequestReceiptView
                        allReports={allReports}
                        report={transactionThreadReport ?? parentReport}
                        readonly={readonly}
                        updatedTransaction={updatedTransaction}
                        mergeTransactionID={mergeTransactionID}
                    />
                )}
                {isCustomUnitOutOfPolicy && isPerDiemRequest && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.mh4, styles.mb2]}>
                        <Icon
                            src={icons.DotIndicator}
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
                        titleIcon={icons.Checkmark}
                        description={amountDescription}
                        titleStyle={styles.textHeadlineH2}
                        interactive={canEditAmount}
                        shouldShowRightIcon={canEditAmount}
                        onPress={() => {
                            if (!transaction?.transactionID || !transactionThreadReport?.reportID) {
                                return;
                            }

                            if (isExpenseSplit && isSplitAvailable) {
                                initSplitExpense(allTransactions, allReports, transaction);
                                return;
                            }

                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(
                                    CONST.IOU.ACTION.EDIT,
                                    iouType,
                                    transaction.transactionID,
                                    transactionThreadReport.reportID,
                                    '',
                                    '',
                                    getReportRHPActiveRoute(),
                                ),
                            );
                        }}
                        brickRoadIndicator={getErrorForField('amount') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('amount')}
                        copyValue={amountCopyValue}
                        copyable={!!amountCopyValue}
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
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(
                                    CONST.IOU.ACTION.EDIT,
                                    iouType,
                                    transaction.transactionID,
                                    transactionThreadReport?.reportID,
                                    getReportRHPActiveRoute(),
                                ),
                            );
                        }}
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        brickRoadIndicator={getErrorForField('comment') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('comment')}
                        numberOfLinesTitle={0}
                        copyValue={descriptionCopyValue}
                        copyable={!!descriptionCopyValue}
                    />
                </OfflineWithFeedback>
                {isManualDistanceRequest || isOdometerDistanceRequest || (isMapDistanceRequest && transaction?.comment?.waypoints) ? (
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
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        iouType,
                                        transaction.transactionID,
                                        transactionThreadReport?.reportID,
                                        getReportRHPActiveRoute(),
                                    ),
                                );
                            }}
                            wrapperStyle={[styles.taskDescriptionMenuItem]}
                            brickRoadIndicator={getErrorForField('merchant') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('merchant')}
                            numberOfLinesTitle={0}
                            copyValue={merchantCopyValue}
                            copyable={!!merchantCopyValue}
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
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(
                                    CONST.IOU.ACTION.EDIT,
                                    iouType,
                                    transaction.transactionID,
                                    transactionThreadReport?.reportID,
                                    getReportRHPActiveRoute(),
                                ),
                            );
                        }}
                        brickRoadIndicator={getErrorForField('date') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('date')}
                        copyValue={dateCopyValue}
                        copyable={!!dateCopyValue}
                    />
                </OfflineWithFeedback>
                {!!shouldShowCategory && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('category')}>
                        <MenuItemWithTopDescription
                            description={translate('common.category')}
                            title={shouldShowCategoryAnalyzing ? translate('common.analyzing') : decodedCategoryName}
                            numberOfLinesTitle={2}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (shouldNavigateToUpgradePath && transactionThreadReport) {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                                            action: CONST.IOU.ACTION.EDIT,
                                            iouType,
                                            transactionID: transaction.transactionID,
                                            reportID: transactionThreadReport?.reportID,
                                            upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                                        }),
                                    );
                                } else if (!policy && shouldSelectPolicy) {
                                    Navigation.navigate(
                                        ROUTES.SET_DEFAULT_WORKSPACE.getRoute(
                                            ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(
                                                CONST.IOU.ACTION.EDIT,
                                                iouType,
                                                transaction.transactionID,
                                                transactionThreadReport?.reportID,
                                                Navigation.getActiveRoute(),
                                            ),
                                        ),
                                    );
                                } else {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(
                                            CONST.IOU.ACTION.EDIT,
                                            iouType,
                                            transaction.transactionID,
                                            transactionThreadReport?.reportID,
                                            Navigation.getActiveRoute(),
                                        ),
                                    );
                                }
                            }}
                            brickRoadIndicator={getErrorForField('category') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('category')}
                            copyValue={categoryCopyValue}
                            copyable={!!categoryCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTag && tagList}
                {!!shouldShowCard && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('cardID')}>
                        <MenuItemWithTopDescription
                            description={translate('iou.card')}
                            title={cardCopyValue}
                            titleStyle={styles.flex1}
                            interactive={false}
                            copyValue={cardCopyValue}
                            copyable={!!cardCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxCode')}>
                        <MenuItemWithTopDescription
                            title={taxRateValue}
                            description={taxRatesDescription}
                            interactive={canEditTaxFields}
                            shouldShowRightIcon={canEditTaxFields}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        iouType,
                                        transaction.transactionID,
                                        transactionThreadReport?.reportID,
                                        getReportRHPActiveRoute(),
                                    ),
                                );
                            }}
                            brickRoadIndicator={getErrorForField('tax') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('tax')}
                            copyValue={taxRateCopyValue}
                            copyable={!!taxRateCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxAmount')}>
                        <MenuItemWithTopDescription
                            title={taxAmountTitle}
                            description={translate('iou.taxAmount')}
                            interactive={canEditTaxFields}
                            shouldShowRightIcon={canEditTaxFields}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        iouType,
                                        transaction.transactionID,
                                        transactionThreadReport?.reportID,
                                        getReportRHPActiveRoute(),
                                    ),
                                );
                            }}
                            copyValue={taxAmountCopyValue}
                            copyable={!!taxAmountCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowAttendees && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('attendees')}>
                        <MenuItemWithTopDescription
                            key="attendees"
                            title={getAttendeesTitle}
                            description={`${translate('iou.attendees')} ${
                                Array.isArray(actualAttendees) && actualAttendees.length > 1 && formattedPerAttendeeAmount
                                    ? `${CONST.DOT_SEPARATOR} ${formattedPerAttendeeAmount} ${translate('common.perPerson')}`
                                    : ''
                            }`}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                Navigation.navigate(ROUTES.MONEY_REQUEST_ATTENDEE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID));
                            }}
                            brickRoadIndicator={getErrorForField('attendees') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('attendees')}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            shouldRenderAsHTML
                            copyValue={attendeesCopyValue}
                            copyable={!!attendeesCopyValue}
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
                                    companyCardPageURL={companyCardPageURL}
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
                            title={reportNameToDisplay}
                            description={translate('common.report')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!canEditReport || !transactionThreadReport) {
                                    return;
                                }
                                if (shouldNavigateToUpgradePath) {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                                            iouType,
                                            action: CONST.IOU.ACTION.EDIT,
                                            transactionID: transaction?.transactionID,
                                            reportID: transactionThreadReport?.reportID,
                                            upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                                        }),
                                    );
                                    return;
                                }
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        iouType,
                                        transaction?.transactionID,
                                        transactionThreadReport?.reportID,
                                        getReportRHPActiveRoute() || lastVisitedPath,
                                    ),
                                );
                            }}
                            interactive={canEditReport}
                            shouldRenderAsHTML
                            copyValue={reportCopyValue}
                            copyable={!!reportCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {/* Note: "View trip details" should be always the last item */}
                {shouldShowViewTripDetails && (
                    <MenuItem
                        title={translate('travel.viewTripDetails')}
                        icon={icons.Suitcase}
                        onPress={() => {
                            const reservations = transaction?.receipt?.reservationList?.length ?? 0;
                            if (reservations > 1) {
                                Navigation.navigate(ROUTES.TRAVEL_TRIP_SUMMARY.getRoute(transactionThreadReport?.reportID, transaction.transactionID, getReportRHPActiveRoute()));
                            }
                            Navigation.navigate(ROUTES.TRAVEL_TRIP_DETAILS.getRoute(transactionThreadReport?.reportID, transaction.transactionID, '0', 0, getReportRHPActiveRoute()));
                        }}
                    />
                )}

                {hasRequiredCompanyCardViolation && (
                    <DotIndicatorMessage
                        type="error"
                        style={[styles.mv3, styles.mh4]}
                        messages={{error: translate('violations.companyCardRequired')}}
                    />
                )}
            </>
        </View>
    );
}

export default MoneyRequestView;
