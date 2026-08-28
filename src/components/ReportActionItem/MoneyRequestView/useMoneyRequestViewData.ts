import {ModalActions} from '@components/Modal/Global/ModalContext';
import {usePersonalDetails, usePolicyCategories, usePolicyTags} from '@components/OnyxListItemProvider';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import {useWideRHPState} from '@components/WideRHPContextProvider';

import useActiveRoute from '@hooks/useActiveRoute';
import useAttendees from '@hooks/useAttendees';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDistanceRateOriginalPolicy from '@hooks/useDistanceRateOriginalPolicy';
import useEnvironment from '@hooks/useEnvironment';
import useHasMultipleSplitChildren from '@hooks/useHasMultipleSplitChildren';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {useDerivedReportNamesByReportIDs} from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactions from '@hooks/useReportTransactions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRestrictedActionPolicyID from '@hooks/useRestrictedActionPolicyID';
import useSplitEffectivePolicy from '@hooks/useSplitEffectivePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import type {ViolationField} from '@hooks/useViolations';
import useViolations from '@hooks/useViolations';

import {updateMoneyRequestBillable, updateMoneyRequestCategory, updateMoneyRequestReimbursable, updateMoneyRequestTag, updateMoneyRequestTaxRate} from '@libs/actions/IOU/UpdateMoneyRequest';
import initSplitExpense from '@libs/actions/SplitExpenses';
import {enrichAndSortAttendees, getIsMissingAttendeesViolation} from '@libs/AttendeeUtils';
import {getBrokenConnectionUrlToFixPersonalCard, getCompanyCardDescription} from '@libs/CardUtils';
import {getDecodedLeafCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {insertTagIntoTransactionTagsString} from '@libs/IOUUtils';
import {getRateFromMerchant} from '@libs/MergeTransactionUtils';
import {isBillableEnabledOnPolicy, isSingleTransactionReport} from '@libs/MoneyRequestReportUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {
    canSubmitPerDiemExpenseFromWorkspace,
    findVendorByID,
    getDistanceRateCustomUnitRate,
    getLengthOfTag,
    getPerDiemCustomUnit,
    getPolicyByCustomUnitID,
    getTagLists,
    hasDependentTags as hasDependentTagsPolicyUtils,
    hasVendorFeature,
    isAttendeeTrackingEnabled,
    isGroupPolicyByType,
    isPerDiemEnabled,
    isPolicyAccessible,
    isTaxTrackingEnabled,
    resolveCurrentTaxCode,
    isXeroActiveMatchingSource,
} from '@libs/PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {isMarkAsCashActionForTransaction} from '@libs/ReportPrimaryActionUtils';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getTransactionDetails,
    getTripIDFromTransactionParentReportID,
    isExpenseReport,
    isInvoiceReport,
    isOpenReport,
    isReportApproved,
    isSettled as isSettledReportUtils,
    isTrackExpenseReportNew,
    shouldEnableNegative,
} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {
    getAttendeesListDisplayString,
    getBillable,
    getCurrency,
    getDescription,
    getDistanceInMeters,
    getFormattedCreated,
    getOriginalAmountForDisplay,
    getOriginalTransactionWithSplitInfo,
    getReimbursable,
    getTaxName,
    hasMissingSmartscanFields,
    hasReservationList,
    hasRoute as hasRouteTransactionUtils,
    isFromCreditCardImport as isCardTransactionTransactionUtils,
    isCategoryBeingAnalyzed,
    isCustomUnitRateIDForP2P,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isDistanceTypeRequest,
    isExpenseUnreported as isExpenseUnreportedTransactionUtils,
    isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils,
    isManagedCardTransaction as isManagedCardTransactionTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isMapDistanceRequest as isMapDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isScanning,
    isTimeRequest as isTimeRequestTransactionUtils,
    isTransactionPendingDelete,
    shouldShowAttendees as shouldShowAttendeesTransactionUtils,
} from '@libs/TransactionUtils';
import {isInvalidMerchantValue} from '@libs/ValidationUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionPendingFieldsKey} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {useRoute} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {policyTypeSelector} from '@selectors/Policy';
import {Str} from 'expensify-common';
import {useState} from 'react';
// Use the original useOnyx hook to get the real-time data from Onyx and not from the snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';

import type {MoneyRequestViewProps} from './types';

const perDiemPoliciesSelector = (policies: OnyxCollection<OnyxTypes.Policy>) => {
    return Object.fromEntries(
        Object.entries(policies ?? {}).filter(([, policyItem]) => {
            const perDiemCustomUnit = getPerDiemCustomUnit(policyItem);
            const hasPolicyPerDiemRates = !isEmptyObject(perDiemCustomUnit?.rates);

            return isPerDiemEnabled(policyItem) && hasPolicyPerDiemRates;
        }),
    );
};

type MoneyRequestViewData = ReturnType<typeof useMoneyRequestViewData>;

function useMoneyRequestViewData({
    transactionThreadReport,
    parentReportID,
    expensePolicy,
    shouldShowAnimatedBackground,
    readonly = false,
    updatedTransaction,
    isFromReviewDuplicates = false,
    mergeTransactionID,
}: MoneyRequestViewProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Checkmark', 'Suitcase', 'NewWindow']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const {environmentURL} = useEnvironment();
    const {translate, toLocaleDigit, localeCompare, dateFnsLocale} = useLocalize();
    const {convertToDisplayString, getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const {getReportRHPActiveRoute} = useActiveRoute();
    const {showConfirmModal} = useConfirmModal();
    const [loginToAccountIDMap] = useOnyx(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP);

    const {currentSearchResults} = useSearchResultsContext();

    // When this component is used when merging from the search page, we might not have the parent report stored in the main collection
    const [parentReportFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`);
    const parentReport = parentReportFromOnyx ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(parentReport?.ownerAccountID)});
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);

    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`);
    const parentReportAction = transactionThreadReport?.parentReportActionID ? parentReportActions?.[transactionThreadReport.parentReportActionID] : undefined;

    const isFromMergeTransaction = !!mergeTransactionID;
    const linkedTransactionID = parentReportAction && isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;
    const [onyxTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(linkedTransactionID)}`);
    const transaction = updatedTransaction ?? onyxTransaction;
    const isExpenseUnreported = isExpenseUnreportedTransactionUtils(transaction);
    const personalPolicy = usePersonalPolicy();
    const {policyForMovingExpensesID, policyForMovingExpenses, shouldSelectPolicy, shouldNavigateToUpgradePath} = usePolicyForMovingExpenses();
    const isTimeRequest = isTimeRequestTransactionUtils(transaction);

    const [policiesWithPerDiem] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: perDiemPoliciesSelector,
    });
    const splitEffectivePolicy = useSplitEffectivePolicy(transactionThreadReport, undefined, transaction);
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);
    const perDiemOriginalPolicy = getPolicyByCustomUnitID(transaction, policiesWithPerDiem);

    const customUnitRateID = isDistanceRequestTransactionUtils(transaction) ? transaction?.comment?.customUnit?.customUnitRateID : undefined;
    const shouldLookupDistancePolicy = !!customUnitRateID && !getDistanceRateCustomUnitRate(expensePolicy, customUnitRateID);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(customUnitRateID, shouldLookupDistancePolicy);

    let policy: OnyxEntry<OnyxTypes.Policy>;
    let policyID: string | undefined;
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

    // Use the report's real policy, not `policy` above (swapped to an unrelated workspace for
    // unreported expenses), else self-DM split editing wrongly redirects to RESTRICTED_ACTION.
    const restrictedActionPolicyID = useRestrictedActionPolicyID(expensePolicy);

    const allPolicyCategories = usePolicyCategories();
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    const targetPolicyID = updatedTransaction?.reportID ? parentReport?.policyID : policyID;
    const allPolicyTags = usePolicyTags();
    const policyTagList = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicyID}`];
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);

    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${getNonEmptyStringOnyxID(linkedTransactionID)}`);
    const transactionViolations = useTransactionViolations(transaction?.transactionID, true, distanceOriginalPolicy ?? policy);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const personalDetailsList = usePersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isP2PDistanceRequest = isCustomUnitRateIDForP2P(transaction);
    const moneyRequestReport = parentReport;
    const parentReportTransactions = useReportTransactions(moneyRequestReport?.reportID);
    // Exclude transactions pending deletion so the report is recognized as single-expense immediately after deleting one of its expenses,
    // instead of waiting for the optimistic delete to be removed from Onyx (https://github.com/Expensify/App/issues/91058).
    // While offline the deleted expense is still rendered, so keep counting it to stay consistent with the visible transaction list.
    const visibleParentReportTransactions = parentReportTransactions.filter((t) => isOffline || !isTransactionPendingDelete(t));
    const isApproved = isReportApproved({report: moneyRequestReport});
    const isInvoice = isInvoiceReport(moneyRequestReport);
    const isTrackExpense = !mergeTransactionID && isTrackExpenseReportNew(transactionThreadReport, moneyRequestReport, parentReportAction);

    let iouType: ValueOf<typeof CONST.IOU.TYPE>;
    if (isTrackExpense) {
        iouType = CONST.IOU.TYPE.TRACK;
    } else if (isInvoice) {
        iouType = CONST.IOU.TYPE.INVOICE;
    } else {
        iouType = CONST.IOU.TYPE.SUBMIT;
    }

    const allowNegativeAmount = shouldEnableNegative(parentReport, policy, iouType);

    const {
        created: transactionDate,
        amount: transactionAmount,
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
    } = getTransactionDetails(transaction, undefined, undefined, allowNegativeAmount, false) ?? {};
    const transactionAttendees = useAttendees(transaction);
    const isEmptyMerchant = isInvalidMerchantValue(transactionMerchant);
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestTransactionUtils(transaction);
    const isOdometerDistanceRequest = isOdometerDistanceRequestTransactionUtils(transaction);
    const isMapDistanceRequest = isMapDistanceRequestTransactionUtils(transaction) || isDistanceTypeRequest(transaction);
    const isTransactionScanning = isScanning(updatedTransaction ?? transaction);
    const hasRoute = hasRouteTransactionUtils(transactionBackup ?? transaction, isDistanceRequest);

    const rawActualAttendees = isFromMergeTransaction && updatedTransaction ? updatedTransaction.comment?.attendees : transactionAttendees;
    const actualAttendees = enrichAndSortAttendees(rawActualAttendees, loginToAccountIDMap, personalDetailsList, localeCompare);

    // Use the updated transaction amount in merge flow to have correct positive/negative sign
    const actualAmount = isFromMergeTransaction && updatedTransaction ? updatedTransaction.amount : transactionAmount;
    const actualCurrency = updatedTransaction ? getCurrency(updatedTransaction) : transactionCurrency;
    const shouldDisplayTransactionAmount = (isDistanceRequest && hasRoute) || !isDistanceRequest;
    const formattedTransactionAmount = shouldDisplayTransactionAmount ? convertToDisplayString(actualAmount, actualCurrency) : '';
    const formattedPerAttendeeAmount =
        shouldDisplayTransactionAmount && actualAmount !== undefined ? convertToDisplayString(actualAmount / (transactionAttendees?.length ?? 1), actualCurrency) : '';

    const transactionOriginalAmount = transaction && getOriginalAmountForDisplay(transaction, isExpenseReport(moneyRequestReport));
    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isFromCardImport = isCardTransactionTransactionUtils(transaction);
    const cardProgramName = getCompanyCardDescription(translate, transaction?.cardName, transaction?.cardID, nonPersonalAndWorkspaceCards);
    const shouldShowCard = isFromCardImport && cardProgramName;

    const taxRates = policy?.taxRates;
    const formattedTaxAmount =
        updatedTransaction?.taxAmount !== undefined
            ? convertToDisplayString(Math.abs(updatedTransaction?.taxAmount), actualCurrency)
            : convertToDisplayString(Math.abs(transactionTaxAmount ?? 0), actualCurrency);
    // Skip a zero converted tax (e.g. tax exempt) so we don't render a redundant "Converted 0.00".
    const formattedConvertedTaxAmount = transaction?.convertedTaxAmount ? convertToDisplayString(Math.abs(transaction.convertedTaxAmount), moneyRequestReport?.currency) : '';

    const taxRatesDescription = taxRates?.name;

    const baseTransaction = updatedTransaction ?? transaction;
    const {taxCode, taxValue} = baseTransaction ?? {};

    const taxRateTitle = getTaxName(policy, baseTransaction, isExpenseUnreported);
    const resolvedTaxCode = taxCode ? resolveCurrentTaxCode(policy, taxCode) : undefined;
    const selectedPolicyTaxValue = resolvedTaxCode ? policy?.taxRates?.taxes?.[resolvedTaxCode]?.value : undefined;
    const hasTaxValueChanged = taxCode && taxValue !== undefined ? selectedPolicyTaxValue !== taxValue : false;

    const actualTransactionDate = isFromMergeTransaction && updatedTransaction ? getFormattedCreated(updatedTransaction) : transactionDate;
    const fallbackTaxRateTitle = transaction?.taxValue;

    const isSettled = isSettledReportUtils(moneyRequestReport);
    const isCancelled = moneyRequestReport?.isCancelledIOU;
    const isChatReportArchived = useReportIsArchived(moneyRequestReport?.chatReportID);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const pendingAction = transaction?.pendingAction;
    const shouldShowPaid = isSettled && transactionReimbursable && !pendingAction;

    // Flags for allowing or disallowing editing an expense
    // Used for non-restricted fields such as: description, category, tag, billable, etc...
    const isReportArchived = useReportIsArchived(transactionThreadReport?.reportID);
    const isEditable = !!canUserPerformWriteActionReportUtils(transactionThreadReport, isReportArchived) && !readonly;
    const canEdit =
        isMoneyRequestAction(parentReportAction) && canEditMoneyRequest(parentReportAction, transaction, isChatReportArchived, moneyRequestReport, policy, parentReportActions) && isEditable;
    const companyCardPageURL = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(transactionThreadReport?.policyID)}`;
    const {personalCardsWithBrokenConnection} = useCardFeedErrors();
    const connectionLink = getBrokenConnectionUrlToFixPersonalCard(personalCardsWithBrokenConnection, environmentURL);
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`);
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const [reportPolicyType] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${moneyRequestReport?.policyID}`, {selector: policyTypeSelector});
    const hasMultipleSplits = useHasMultipleSplitChildren(transaction?.comment?.originalTransactionID);
    const isReportOpen = isOpenReport(moneyRequestReport);
    const shouldShowSplitIndicator = isExpenseSplit && (hasMultipleSplits || isReportOpen);
    const isSplitAvailable =
        moneyRequestReport &&
        transaction &&
        isSplitAction(moneyRequestReport, [transaction], originalTransaction, currentUserPersonalDetails.login ?? '', currentUserPersonalDetails.accountID, policy);

    const canEditTaxFields = canEdit && !isDistanceRequest;
    const canEditAmount =
        !isGPSDistanceRequest &&
        isEditable &&
        (canEditFieldOfMoneyRequest({
            reportAction: parentReportAction,
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.AMOUNT,
            isChatReportArchived,
            reportNameValuePairs,
            transaction,
        }) ||
            (shouldShowSplitIndicator && isSplitAvailable));
    const canEditMerchant =
        isEditable &&
        canEditFieldOfMoneyRequest({
            reportAction: parentReportAction,
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.MERCHANT,
            isChatReportArchived,
            reportNameValuePairs,
            transaction,
            report: moneyRequestReport,
            policy,
        });

    const canEditDate =
        isEditable &&
        canEditFieldOfMoneyRequest({
            reportAction: parentReportAction,
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.DATE,
            isChatReportArchived,
            reportNameValuePairs,
            transaction,
            report: moneyRequestReport,
            policy,
        });

    const canEditDistanceOrRate = isPolicyAccessible(policy, currentUserEmailParam) || isTrackExpense || isP2PDistanceRequest;

    const canEditDistance =
        !isGPSDistanceRequest &&
        isEditable &&
        canEditFieldOfMoneyRequest({
            reportAction: parentReportAction,
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.DISTANCE,
            isChatReportArchived,
            reportNameValuePairs,
            transaction,
            report: moneyRequestReport,
            policy,
        }) &&
        canEditDistanceOrRate;

    const canEditDistanceRate =
        isEditable &&
        canEditFieldOfMoneyRequest({
            reportAction: parentReportAction,
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.DISTANCE_RATE,
            isChatReportArchived,
            reportNameValuePairs,
            transaction,
            report: moneyRequestReport,
            policy,
        }) &&
        canEditDistanceOrRate;

    const canEditReport =
        isEditable &&
        canEditFieldOfMoneyRequest({
            reportAction: parentReportAction,
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
            isChatReportArchived,
            outstandingReportsByPolicyID,
            reportNameValuePairs,
            transaction,
            report: moneyRequestReport,
            policy,
        }) &&
        (!isPerDiemRequest || canSubmitPerDiemExpenseFromWorkspace(policy) || (isExpenseUnreported && !!perDiemOriginalPolicy));

    // A flag for verifying that the current report is a sub-report of a expense chat
    // if the policy of the report is either Collect or Control, then this report must be tied to expense chat
    const isPolicyExpenseChat = isGroupPolicyByType(reportPolicyType);
    const policyTagLists = getTagLists(policyTagList);

    const category = transactionCategory ?? '';
    const categoryForDisplay = isCategoryMissing(category) ? '' : category;

    // Flags for showing categories and tags
    // transactionCategory can be an empty string

    const shouldShowCategory =
        (isPolicyExpenseChat && (categoryForDisplay || hasEnabledOptions(policyCategories ?? {}))) ||
        (isExpenseUnreported && (!policyForMovingExpenses || hasEnabledOptions(policyCategories ?? {})));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowTag = (isPolicyExpenseChat || isExpenseUnreported) && (transactionTag || (canEdit && hasEnabledTags(policyTagLists)));
    // Surface a delete confirmation (like tax) when the value is stale and there's nothing valid to select, instead of
    // navigating to edit. Categories need at least one, so they only hit this when disabled; tags can be fully emptied,
    // so also cover "no enabled tags remain". Applies to multi-level tags too - deleting clears the whole tag value.
    const shouldShowCategoryDisabledAlert = !policy?.areCategoriesEnabled && !!category;
    const shouldShowTagDisabledAlert = (!policy?.areTagsEnabled || !hasEnabledTags(policyTagLists)) && !!transactionTag;
    const shouldShowBillable = (isPolicyExpenseChat || isExpenseUnreported) && (!!transactionBillable || isBillableEnabledOnPolicy(policy) || !!updatedTransaction?.billable);
    const isCurrentTransactionReimbursableDifferentFromPolicyDefault =
        policy?.defaultReimbursable !== undefined && !!(updatedTransaction?.reimbursable ?? transactionReimbursable) !== policy.defaultReimbursable;
    const shouldShowReimbursable =
        (isPolicyExpenseChat || (isExpenseUnreported && !!policy)) &&
        (policy?.disabledFields?.reimbursable !== true || isCurrentTransactionReimbursableDifferentFromPolicyDefault) &&
        !isManagedCardTransactionTransactionUtils(transaction) &&
        !isInvoice;
    const canEditReimbursable =
        isEditable &&
        canEditFieldOfMoneyRequest({
            reportAction: parentReportAction,
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.REIMBURSABLE,
            isChatReportArchived,
            reportNameValuePairs,
            transaction,
            report: moneyRequestReport,
            policy,
        });
    const shouldShowAttendees = shouldShowAttendeesTransactionUtils(iouType, policy);

    const transactionVendor = transaction?.comment?.vendor;

    // The title prefers any matched vendor name (active vendor-matching integration first, then a
    // permissive cross-connection lookup), then the display name persisted on the transaction at
    // match/assign time. When no connection has the vendor any more and no name was persisted, fall
    // back to the raw externalID so admins still see a stable identifier for what was assigned — the
    // red INACTIVE_VENDOR violation (from ViolationsUtils, scoped to the active integration) provides
    // the "Vendor no longer valid" indicator separately.
    const matchedVendorName = findVendorByID(policy, transactionVendor?.externalID)?.name;
    let transactionVendorName = '';
    if (matchedVendorName) {
        transactionVendorName = matchedVendorName;
    } else if (transactionVendor?.name) {
        transactionVendorName = transactionVendor.name;
    } else if (transactionVendor?.externalID) {
        transactionVendorName = transactionVendor.externalID;
    }
    const shouldShowVendor = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING)) && !(updatedTransaction?.reimbursable ?? !!transactionReimbursable) && !isInvoice;
    const vendorFieldLabel = isXeroActiveMatchingSource(policy) ? translate('common.supplier') : translate('common.vendor');

    const tripID = getTripIDFromTransactionParentReportID(parentReport?.parentReportID);
    const shouldShowViewTripDetails = hasReservationList(transaction) && !!tripID;

    const transactionTripID = transaction?.comment?.tripID;

    // Trip rooms are the grandparent report, so check that first before scanning the collection.
    const grandparentReportID = parentReport?.parentReportID;
    const tripRoomReportSelector = (reports: OnyxCollection<OnyxTypes.Report>): OnyxEntry<OnyxTypes.Report> => {
        if (!transactionTripID || !reports) {
            return undefined;
        }
        const grandparent = grandparentReportID ? reports[`${ONYXKEYS.COLLECTION.REPORT}${grandparentReportID}`] : undefined;
        const match =
            grandparent?.tripData?.tripID === transactionTripID ? grandparent : Object.values(reports).find((candidateReport) => candidateReport?.tripData?.tripID === transactionTripID);
        if (!match?.reportID) {
            return undefined;
        }
        return match;
    };
    const [tripRoomReport] = originalUseOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: tripRoomReportSelector});
    const tripRoomReportID = tripRoomReport?.reportID;

    const derivedReportNames = useDerivedReportNamesByReportIDs([tripRoomReportID, parentReport?.reportID]);

    const tripRoomDerivedName = tripRoomReportID ? derivedReportNames?.[tripRoomReportID] : undefined;
    const tripRoomName = tripRoomReport ? getReportName(tripRoomReport, tripRoomDerivedName) : undefined;
    const shouldShowTripRoomLink = !!tripRoomReportID && !!tripRoomName;
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const {getViolationsForField} = useViolations(transactionViolations ?? [], isTransactionScanning || !isGroupPolicyByType(reportPolicyType));
    const hasViolations = (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string): boolean =>
        getViolationsForField(field, data, policyHasDependentTags, tagValue).length > 0;
    const isMarkAsCash = parentReport && currentUserEmailParam ? isMarkAsCashActionForTransaction(currentUserEmailParam, parentReport, transactionViolations, policy) : false;
    // Need to return undefined when we have pendingAction to avoid the duplicate pending action
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => (pendingAction ? undefined : transaction?.pendingFields?.[fieldPath]);

    const isTaxEnabled = isTaxTrackingEnabled(isPolicyExpenseChat || isExpenseUnreported, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest);
    const shouldShowTaxDisabledAlert = !isTaxEnabled && !!transaction?.taxCode && !isTimeRequest && !isPerDiemRequest;
    const shouldShowTax = isFromMergeTransaction ? !!transaction?.taxName : isTaxEnabled || shouldShowTaxDisabledAlert;

    let amountDescription = `${translate('iou.amount')}`;
    let dateDescription = `${translate('common.date')}`;

    const {
        unit,
        rate,
        name: rateName,
    } = DistanceRequestUtils.getRate({
        transaction: updatedTransaction ?? transaction,
        policy: distanceOriginalPolicy ?? policy,
        personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
    });
    const distance = getDistanceInMeters(transactionBackup ?? updatedTransaction ?? transaction, unit);
    const currency = transactionCurrency ?? CONST.CURRENCY.USD;
    const hasRequiredCompanyCardViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.COMPANY_CARD_REQUIRED);
    const isCustomUnitOutOfPolicy =
        (transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY) || (isDistanceRequest && !rate)) && !isTrackExpense;
    const calculateFromTransactionData = isTrackExpense && !rate;
    const distanceUnit = calculateFromTransactionData ? transaction?.comment?.customUnit?.distanceUnit : unit;
    const distanceRate = calculateFromTransactionData ? (transactionAmount ?? 0) / (transaction?.comment?.customUnit?.quantity ?? 1) : rate;
    let rateToDisplay = DistanceRequestUtils.getRateForExpenseDisplay(
        rateName,
        isCustomUnitOutOfPolicy,
        distanceUnit,
        distanceRate,
        currency,
        translate,
        toLocaleDigit,
        getCurrencySymbol,
        isOffline,
    );

    const distanceUnitValue = transaction?.comment?.customUnit?.distanceUnit ?? unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    // Commuter exclusions are a workspace control, so they are never surfaced on a personal (self-DM or P2P) expense,
    // even if one carries the fields from a workspace rate it was created with.
    const commuterExclusionData =
        transaction?.comment?.originalTransactionID || !isPolicyExpenseChat
            ? null
            : DistanceRequestUtils.getCommuterExclusionDisplayData(transaction?.comment?.customUnit, distanceUnitValue);
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, translate, false, isManualDistanceRequest, commuterExclusionData);
    const {distanceToDisplayDescription, distanceToDisplayHintText} = DistanceRequestUtils.getDistanceDisplayDetailsWithCommuter(commuterExclusionData, distanceUnitValue, translate);

    let merchantTitle = isEmptyMerchant ? '' : transactionMerchant;
    let amountTitle = formattedTransactionAmount?.toString() || '';
    if (isTransactionScanning) {
        merchantTitle = translate('iou.receiptStatusTitle');
        amountTitle = translate('iou.receiptStatusTitle');
    }

    const updatedTransactionDescription = getDescription(updatedTransaction) || undefined;
    const shouldHideEmptyDescription = (isFromReviewDuplicates || isFromMergeTransaction) && !(updatedTransactionDescription ?? transactionDescription);
    const isEmptyUpdatedMerchant = isInvalidMerchantValue(updatedTransaction?.modifiedMerchant);
    const updatedMerchantTitle = isEmptyUpdatedMerchant ? '' : (updatedTransaction?.modifiedMerchant ?? merchantTitle);
    const originalMerchantForGoogleSearch = isInvalidMerchantValue(onyxTransaction?.merchant) ? '' : Str.recapitalize(onyxTransaction?.merchant ?? '');
    const shouldShowGoogleMerchantSearchLink = !!originalMerchantForGoogleSearch && !isTransactionScanning && isFromCardImport;

    const shouldShowConvertedAmount =
        transactionConvertedAmount &&
        currency !== moneyRequestReport?.currency &&
        !isFromCardImport &&
        transaction?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID &&
        !isFromMergeTransaction &&
        !isFromReviewDuplicates &&
        !getPendingFieldAction('amount') &&
        !pendingAction;

    if (isFromCardImport) {
        if (transactionPostedDate) {
            dateDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.posted')} ${transactionPostedDate}`;
        }
        if (formattedOriginalAmount) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.purchase')} ${formattedOriginalAmount}`;
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
    if (shouldShowSplitIndicator) {
        amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.split')}`;
    }
    if (shouldShowConvertedAmount) {
        amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('common.converted')} ${convertToDisplayString(transactionConvertedAmount, moneyRequestReport?.currency)}`;
    }
    const isCurrentTransactionReimbursable = updatedTransaction?.reimbursable ?? !!transactionReimbursable;
    if (!isCurrentTransactionReimbursable && isSingleTransactionReport(moneyRequestReport, visibleParentReportTransactions)) {
        amountDescription += ` ${CONST.DOT_SEPARATOR} ${Str.UCFirst(translate('iou.nonReimbursable'))}`;
    }

    // Show the converted tax here since the redundant report-level Tax total is hidden for a single-expense report.
    let taxAmountDescription = translate('iou.taxAmount');
    if (shouldShowConvertedAmount && formattedConvertedTaxAmount) {
        taxAmountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('common.converted')} ${formattedConvertedTaxAmount}`;
    }

    if (isFromMergeTransaction && !rateName) {
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
        isAttendeeTrackingEnabled(policy),
        policy?.type === CONST.POLICY.TYPE.CORPORATE,
    );

    const getErrorForField = (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string) => {
        // Checks applied when creating a new expense
        // NOTE: receipt field can return multiple violations, so we need to handle it separately
        const fieldChecks: Partial<Record<ViolationField, {isError: boolean; translationPath: TranslationPaths}>> = {
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
            return `${violations
                .map((violation) => {
                    const cardID = violation.data?.cardID;
                    const card = cardID ? cardList?.[cardID] : undefined;
                    return ViolationsUtils.getViolationTranslation({
                        dateFnsLocale,
                        violation,
                        translate,
                        convertToDisplayString,
                        canEdit,
                        companyCardPageURL,
                        connectionLink,
                        card,
                        isMarkAsCash,
                        routeDistanceMeters: transaction?.comment?.customUnit?.routeDistanceMeters,
                        distanceUnit: transaction?.comment?.customUnit?.distanceUnit,
                    });
                })
                .join('. ')}.`;
        }

        if (field === 'attendees' && isMissingAttendeesViolation) {
            return translate('violations.missingAttendees');
        }

        return '';
    };

    const saveBillable = (newBillable: boolean) => {
        // If the value hasn't changed, don't request to save changes on the server and just close the modal
        if (newBillable === getBillable(transaction) || !transaction?.transactionID || !transactionThreadReport?.reportID) {
            return;
        }
        updateMoneyRequestBillable({
            transactionID: transaction.transactionID,
            transactionThreadReport,
            parentReport,
            iouReportOwnerLogin,
            value: newBillable,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            isOffline,
            delegateAccountID,
            reportPolicyTags,
            isTrackIntentUser,
            getCurrencyDecimals,
            getCurrencySymbol,
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
            iouReportOwnerLogin,
            value: newReimbursable,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            isOffline,
            delegateAccountID,
            reportPolicyTags,
            isTrackIntentUser,
            getCurrencyDecimals,
            getCurrencySymbol,
        });
    };

    const showTaxDisabledAlert = () => {
        showConfirmModal({
            title: translate('iou.taxDisabledAlert.title'),
            prompt: translate('iou.taxDisabledAlert.prompt'),
            confirmText: translate('iou.taxDisabledAlert.confirmText'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM || !canEditTaxFields) {
                return;
            }

            updateMoneyRequestTaxRate({
                transactionID: transaction?.transactionID,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin,
                taxCode: '',
                taxValue: '',
                taxAmount: 0,
                policy,
                policyTagList,
                policyCategories,
                currentUserAccountIDParam,
                currentUserEmailParam,
                isASAPSubmitBetaEnabled,
                delegateAccountID,
                reportPolicyTags,
                isTrackIntentUser,
                getCurrencyDecimals,
                getCurrencySymbol,
            });
        });
    };

    const showCategoryDisabledAlert = () => {
        const transactionID = transaction?.transactionID;
        if (!transactionID) {
            return;
        }
        showConfirmModal({
            title: translate('iou.categoryDisabledAlert.title'),
            prompt: translate('iou.categoryDisabledAlert.prompt'),
            confirmText: translate('iou.categoryDisabledAlert.confirmText'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM || !canEdit) {
                return;
            }

            updateMoneyRequestCategory({
                transactionID,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin,
                category: '',
                policy,
                policyTagList,
                policyCategories,
                policyRecentlyUsedCategories: undefined,
                currentUserAccountIDParam,
                currentUserEmailParam,
                isASAPSubmitBetaEnabled,
                delegateAccountID,
                reportPolicyTags,
                isTrackIntentUser,
                getCurrencyDecimals,
                getCurrencySymbol,
            });
        });
    };

    const showTagDisabledAlert = (tagListIndex: number) => {
        const transactionID = transaction?.transactionID;
        if (!transactionID) {
            return;
        }
        showConfirmModal({
            title: translate('iou.tagDisabledAlert.title'),
            prompt: translate('iou.tagDisabledAlert.prompt'),
            confirmText: translate('iou.tagDisabledAlert.confirmText'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM || !canEdit) {
                return;
            }

            // Clear only the pressed level so the other levels of a multi-level tag are kept.
            const updatedTag = insertTagIntoTransactionTagsString(transactionTag ?? '', '', tagListIndex, policy?.hasMultipleTagLists ?? false);
            updateMoneyRequestTag({
                transactionID,
                transactionThreadReport,
                parentReport,
                iouReportOwnerLogin,
                tag: updatedTag,
                policy,
                policyTagList,
                policyRecentlyUsedTags: undefined,
                policyCategories,
                currentUserAccountIDParam,
                currentUserEmailParam,
                isASAPSubmitBetaEnabled,
                isOffline,
                delegateAccountID,
                reportPolicyTags,
                isTrackIntentUser,
                getCurrencyDecimals,
                getCurrencySymbol,
            });
        });
    };

    const distanceCopyValue = !canEditDistance ? distanceToDisplay : undefined;
    const distanceRateCopyValue = !canEditDistanceRate ? rateToDisplay : undefined;
    const amountCopyValue = !canEditAmount ? amountTitle : undefined;
    const descriptionHTML = updatedTransactionDescription ?? transactionDescription;
    const descriptionCopyValue = !canEdit && descriptionHTML ? Parser.htmlToText(descriptionHTML) : undefined;
    const merchantCopyValue = !canEditMerchant ? updatedMerchantTitle : undefined;
    const dateCopyValue = !canEditDate ? transactionDate : undefined;
    const categoryValue = updatedTransaction?.category ?? categoryForDisplay;
    const decodedCategoryName = getDecodedLeafCategoryName(categoryValue);
    const categoryCopyValue = !canEdit ? decodedCategoryName : undefined;
    const cardCopyValue = cardProgramName;
    const taxRateValue = hasTaxValueChanged ? taxValue : (transaction?.taxName ?? taxRateTitle ?? fallbackTaxRateTitle ?? '');
    const taxRateCopyValue = !canEditTaxFields ? taxRateValue : undefined;
    const taxAmountTitle = formattedTaxAmount ? formattedTaxAmount.toString() : '';
    const taxAmountCopyValue = !canEditTaxFields ? taxAmountTitle : undefined;

    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTagList);

    const [previousTransactionTag, setPreviousTransactionTag] = useState(transactionTag);
    const [previousTag, setPreviousTag] = useState<string | undefined>(undefined);
    const [currentTransactionTag, setCurrentTransactionTag] = useState<string | undefined>(undefined);
    if (transactionTag !== previousTransactionTag) {
        setPreviousTransactionTag(transactionTag);
        setPreviousTag(previousTransactionTag);
        setCurrentTransactionTag(transactionTag);
    }
    const previousTagLength = getLengthOfTag(previousTag ?? '');
    const currentTagLength = getLengthOfTag(currentTransactionTag ?? '');

    // actualAttendees is already sorted by enrichAndSortAttendees above; pass without localeCompare to preserve that order while stripping the SMS domain.
    const getAttendeesTitle = Array.isArray(actualAttendees) ? getAttendeesListDisplayString(actualAttendees) : '';
    const attendeesCopyValue = !canEdit ? getAttendeesTitle : undefined;

    const parentReportDerivedName = parentReport?.reportID ? derivedReportNames?.[parentReport.reportID] : undefined;
    const reportNameToDisplay = isFromMergeTransaction ? (updatedTransaction?.reportName ?? translate('common.none')) : getReportName(parentReport, parentReportDerivedName);
    const shouldShowReport = !!parentReportID || (isFromMergeTransaction && !!reportNameToDisplay);
    const reportCopyValue = !canEditReport && reportNameToDisplay !== translate('common.none') ? reportNameToDisplay : undefined;
    const shouldShowCategoryAnalyzing = isCategoryBeingAnalyzed(updatedTransaction ?? transaction);

    // In this case we want to use this value. The shouldUseNarrowLayout will always be true as this case is handled when we display ReportScreen in RHP.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys} = useWideRHPState();
    const route = useRoute();
    // The receipt is hidden only for the MoneyRequestView rendered inside a wide RHP, where the wide RHP's left
    // receipt panel already shows it. Instances mounted on other screens (e.g. the central report pane behind
    // the RHP) must keep their inline receipt, so the check is scoped to this view's own route key.
    const isInWideRHP = wideRHPRouteKeys.includes(route.key);

    const isLoading = (!readonly && !transactionThreadReport?.reportID) || !transaction?.transactionID;

    const onAmountPress = () => {
        if (!transaction?.transactionID || !transactionThreadReport?.reportID) {
            return;
        }

        if (shouldShowSplitIndicator && isSplitAvailable) {
            initSplitExpense(
                transaction,
                transactionThreadReport,
                splitEffectivePolicy,
                selfDMReportID,
                restrictedActionPolicyID,
                personalPolicy?.outputCurrency,
                getCurrencyDecimals,
                getCurrencySymbol,
            );
            return;
        }

        Navigation.navigate(
            ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport.reportID, '', '', getReportRHPActiveRoute()),
        );
    };

    const onDescriptionPress = () => {
        if (!transaction?.transactionID) {
            return;
        }
        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID)),
        );
    };

    const onMerchantPress = () => {
        if (!transaction?.transactionID) {
            return;
        }
        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID)),
        );
    };

    const onDatePress = () => {
        if (!transaction?.transactionID) {
            return;
        }
        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID)),
        );
    };

    const onCategoryPress = () => {
        if (shouldShowCategoryDisabledAlert) {
            showCategoryDisabledAlert();
            return;
        }

        if (!transaction?.transactionID) {
            return;
        }

        if (shouldNavigateToUpgradePath && transactionThreadReport) {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action: CONST.IOU.ACTION.EDIT,
                        iouType,
                        transactionID: transaction.transactionID,
                        reportID: transactionThreadReport?.reportID,
                        upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                        upgradeBackTo: createDynamicRoute(
                            DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({
                                action: CONST.IOU.ACTION.EDIT,
                                iouType,
                                transactionID: transaction.transactionID,
                                reportID: transactionThreadReport?.reportID,
                            }),
                        ),
                    }),
                ),
            );
        } else if (!policy && shouldSelectPolicy) {
            Navigation.navigate(
                ROUTES.SET_DEFAULT_WORKSPACE.getRoute(
                    createDynamicRoute(
                        DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({
                            action: CONST.IOU.ACTION.EDIT,
                            iouType,
                            transactionID: transaction.transactionID,
                            reportID: transactionThreadReport?.reportID,
                        }),
                    ),
                ),
            );
        } else {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({
                        action: CONST.IOU.ACTION.EDIT,
                        iouType,
                        transactionID: transaction.transactionID,
                        reportID: transactionThreadReport?.reportID,
                    }),
                ),
            );
        }
    };

    const onDistancePress = () => {
        if (!transaction?.transactionID || !transactionThreadReport?.reportID) {
            return;
        }

        if (isOdometerDistanceRequest) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport.reportID));
            return;
        }

        if (isManualDistanceRequest) {
            Navigation.navigate(
                createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport.reportID)),
            );
            return;
        }

        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport.reportID)),
        );
    };

    const onDistanceRatePress = () => {
        if (!transaction?.transactionID || !transactionThreadReport?.reportID) {
            return;
        }

        if (isTrackExpense) {
            if (shouldNavigateToUpgradePath && transactionThreadReport) {
                Navigation.navigate(
                    createDynamicRoute(
                        DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                            action: CONST.IOU.ACTION.EDIT,
                            iouType,
                            transactionID: transaction.transactionID,
                            reportID: transactionThreadReport?.reportID,
                            upgradePath: CONST.UPGRADE_PATHS.DISTANCE_RATES,
                        }),
                    ),
                );
                return;
            }
            if (!policy && shouldSelectPolicy) {
                Navigation.navigate(
                    ROUTES.SET_DEFAULT_WORKSPACE.getRoute(
                        createDynamicRoute(
                            DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID),
                        ),
                    ),
                );
                return;
            }
        }

        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport.reportID)),
        );
    };

    const onTaxRatePress = () => {
        if (shouldShowTaxDisabledAlert) {
            showTaxDisabledAlert();
            return;
        }

        if (!transaction?.transactionID) {
            return;
        }

        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID)),
        );
    };

    const onTaxAmountPress = () => {
        if (shouldShowTaxDisabledAlert) {
            showTaxDisabledAlert();
            return;
        }

        if (!transaction?.transactionID) {
            return;
        }

        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID)),
        );
    };

    const onReportPress = () => {
        if (!canEditReport || !transactionThreadReport || !transaction?.transactionID) {
            return;
        }
        if (shouldNavigateToUpgradePath) {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        iouType,
                        action: CONST.IOU.ACTION.EDIT,
                        transactionID: transaction.transactionID,
                        reportID: transactionThreadReport?.reportID,
                        upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                    }),
                ),
            );
            return;
        }
        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID)),
        );
    };

    const onTripRoomPress = () => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(tripRoomReportID, undefined, undefined, Navigation.getActiveRoute()));
    };

    const onViewTripDetailsPress = () => {
        if (!transaction?.transactionID) {
            return;
        }
        const reservations = transaction?.receipt?.reservationList?.length ?? 0;
        if (reservations > 1) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_TRIP_SUMMARY.getRoute(transactionThreadReport?.reportID, transaction.transactionID)));
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_TRIP_DETAILS.getRoute(transactionThreadReport?.reportID, transaction.transactionID, '0', 0)));
    };

    const onAttendeesPress = () => {
        if (!transaction?.transactionID) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_ATTENDEE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport?.reportID)));
    };

    const onVendorPress = () => {
        if (!transactionThreadReport?.reportID || !transaction?.transactionID) {
            return;
        }
        Navigation.navigate(
            ROUTES.MONEY_REQUEST_STEP_VENDOR.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction.transactionID, transactionThreadReport.reportID, getReportRHPActiveRoute()),
        );
    };

    return {
        // Loading / guard
        isLoading,

        // Styles / localize
        styles,
        theme,
        StyleUtils,
        icons,
        translate,

        // Core data
        transaction,
        transactionThreadReport,
        parentReport,
        policy,
        policyID,
        iouType,
        transactionReimbursable,
        transactionBillable,
        transactionDescription,
        updatedTransactionDescription,
        readonly,
        updatedTransaction,
        mergeTransactionID,
        isFromReviewDuplicates,
        shouldShowAnimatedBackground,

        // Derived booleans
        isDistanceRequest,
        isManualDistanceRequest,
        isGPSDistanceRequest,
        isOdometerDistanceRequest,
        isMapDistanceRequest,
        isPerDiemRequest,
        isFromCardImport,
        isFromMergeTransaction,
        isTransactionScanning,
        isCustomUnitOutOfPolicy,
        hasRequiredCompanyCardViolation,
        shouldShowPaid,
        isInWideRHP,
        isSmallScreenWidth,
        shouldHideEmptyDescription,
        shouldShowCategoryAnalyzing,

        // Editing permissions
        canEdit,
        canEditAmount,
        canEditMerchant,
        canEditDate,
        canEditDistance,
        canEditDistanceRate,
        canEditTaxFields,
        canEditReport,
        canEditReimbursable,

        // Display values
        amountTitle,
        amountDescription,
        actualTransactionDate,
        transactionDate,
        dateDescription,
        updatedMerchantTitle,
        merchantTitle,
        distanceToDisplay,
        distanceToDisplayDescription,
        distanceToDisplayHintText,
        rateToDisplay,
        decodedCategoryName,
        taxRateValue,
        taxAmountTitle,
        taxAmountDescription,
        taxRatesDescription,
        reportNameToDisplay,
        reportCopyValue,
        tripRoomName,
        tripRoomReportID,
        transactionVendorName,
        vendorFieldLabel,
        cardProgramName,
        cardCopyValue,
        getAttendeesTitle,
        formattedPerAttendeeAmount,
        actualAttendees,

        // Visibility flags
        shouldShowCategory,
        shouldShowTag,
        shouldShowBillable,
        shouldShowReimbursable,
        shouldShowTax,
        shouldShowTaxDisabledAlert,
        shouldShowAttendees,
        shouldShowVendor,
        shouldShowReport,
        shouldShowTripRoomLink,
        shouldShowViewTripDetails,
        shouldShowCard,
        shouldShowGoogleMerchantSearchLink,
        shouldShowTagDisabledAlert,
        originalMerchantForGoogleSearch,

        // Violation / error helpers
        getViolationsForField,
        companyCardPageURL,
        connectionLink,
        isMarkAsCash,

        // Copy values
        amountCopyValue,
        descriptionCopyValue,
        merchantCopyValue,
        dateCopyValue,
        categoryCopyValue,
        distanceCopyValue,
        distanceRateCopyValue,
        taxRateCopyValue,
        taxAmountCopyValue,
        attendeesCopyValue,

        // Callbacks / actions
        saveBillable,
        saveReimbursable,
        showTagDisabledAlert,
        getErrorForField,
        getPendingFieldAction,
        onAmountPress,
        onDescriptionPress,
        onMerchantPress,
        onDatePress,
        onCategoryPress,
        onDistancePress,
        onDistanceRatePress,
        onTaxRatePress,
        onTaxAmountPress,
        onReportPress,
        onTripRoomPress,
        onViewTripDetailsPress,
        onAttendeesPress,
        onVendorPress,

        // Tag rendering data
        hasDependentTags,
        policyTagLists,
        transactionTag,
        previousTagLength,
        currentTagLength,
    };
}

export default useMoneyRequestViewData;
export type {MoneyRequestViewData};
