import type {TupleToUnion} from 'type-fest';
import {isCurrencySupportedForGlobalReimbursement} from '@libs/actions/Policy/Policy';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import {formatPaymentMethods, getBusinessBankAccountOptions} from '@libs/PaymentUtils';
import {getPolicyEmployeeAccountIDs} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {doesReportBelongToWorkspace, isExpenseReport as isExpenseReportUtil, isInvoiceReport as isInvoiceReportUtil, isIOUReport as isIOUReportUtil} from '@libs/ReportUtils';
import {useSettlementButtonPaymentMethods} from '@libs/SettlementButtonUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountData, Report} from '@src/types/onyx';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useActiveAdminPolicies from './useActiveAdminPolicies';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';
import useThemeStyles from './useThemeStyles';

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

type UseSettlementDataProps = {
    chatReportID?: string;
    iouReport?: Report;
    policyID?: string;
    currency?: string;
    shouldHidePaymentOptions?: boolean;
    shouldShowPersonalBankAccountOption?: boolean;
    /** When true, policyIDKey falls back to CONST.POLICY.ID_FAKE instead of iouReport?.policyID.
     * usePaymentOptions needs this to preserve DM-entry lookup for personal/1:1 IOUs. */
    shouldUseFakePolicyFallback?: boolean;
};

/**
 * Shared data hook for payment-related components.
 * Centralizes Onyx subscriptions, derived flags, and bank account filtering
 * used by SettlementButton, usePaymentOptions, and useBulkPayOptions.
 */
function useSettlementData({
    chatReportID = '',
    iouReport,
    policyID = '-1',
    currency,
    shouldHidePaymentOptions = false,
    shouldShowPersonalBankAccountOption = false,
    shouldUseFakePolicyFallback = false,
}: UseSettlementDataProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const {accountID} = useCurrentUserPersonalDetails();

    // The app would crash due to subscribing to the entire report collection if chatReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID || CONST.DEFAULT_NUMBER_ID}`);
    const [conciergeReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const {isBetaEnabled} = usePermissions();

    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const paymentMethods = useSettlementButtonPaymentMethods(hasActivatedWallet, translate);

    const policyEmployeeAccountIDs = getPolicyEmployeeAccountIDs(policy, accountID);
    const reportBelongsToWorkspace = policyID ? doesReportBelongToWorkspace(chatReport, policyEmployeeAccountIDs, policyID, conciergeReportID) : false;
    let policyIDKey: string;
    if (reportBelongsToWorkspace) {
        policyIDKey = policyID;
    } else if (shouldUseFakePolicyFallback) {
        policyIDKey = CONST.POLICY.ID_FAKE;
    } else {
        policyIDKey = iouReport?.policyID ?? CONST.POLICY.ID_FAKE;
    }

    const activeAdminPolicies = useActiveAdminPolicies();
    const reportID = iouReport?.reportID;

    const isExpenseReport = isExpenseReportUtil(iouReport);
    const isInvoiceReport = (!isEmptyObject(iouReport) && isInvoiceReportUtil(iouReport)) || false;

    const formattedPaymentMethods = formatPaymentMethods(bankAccountList ?? {}, fundList ?? {}, styles, translate);
    const personalBankAccountList = formattedPaymentMethods.filter((ba) => (ba.accountData as AccountData)?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL);
    const businessBankAccountOptionList = getBusinessBankAccountOptions(formattedPaymentMethods);

    const canUseWallet = !isExpenseReport && !isInvoiceReport && isCurrencySupportedForGlobalReimbursement(currency as CurrencyType);
    const canUseBusinessBankAccount = isExpenseReport || (isIOUReportUtil(iouReport) && !!reportID && !hasRequestFromCurrentAccount(reportID, accountID ?? CONST.DEFAULT_NUMBER_ID));
    const canUsePersonalBankAccount = shouldShowPersonalBankAccountOption || isIOUReportUtil(iouReport);
    const isPersonalOnlyOption = canUsePersonalBankAccount && !canUseBusinessBankAccount;

    // whether the user has single policy and the expense is p2p
    const hasSinglePolicy = !isExpenseReport && activeAdminPolicies.length === 1;
    const hasMultiplePolicies = !isExpenseReport && activeAdminPolicies.length > 1;

    const shouldShowPayWithExpensifyOption = !shouldHidePaymentOptions;
    const shouldShowPayElsewhereOption = !shouldHidePaymentOptions && !isInvoiceReport;

    const isPayInvoiceViaExpensifyBetaEnabled = isBetaEnabled(CONST.BETAS.PAY_INVOICE_VIA_EXPENSIFY);
    const showPayViaExpensifyOptions = isPayInvoiceViaExpensifyBetaEnabled && isCurrencySupportedForGlobalReimbursement(currency as CurrencyType);

    /** Filters bank accounts by type and excludes partially setup accounts. */
    const getFilteredBankItems = <T>(payAsBusiness: boolean, mapItem: (method: PaymentMethod) => T): T[] => {
        const requiredAccountType = payAsBusiness ? CONST.BANK_ACCOUNT.TYPE.BUSINESS : CONST.BANK_ACCOUNT.TYPE.PERSONAL;
        return formattedPaymentMethods
            .filter((method) => {
                const accountData = method?.accountData as AccountData;
                const isPartiallySetup = isBankAccountPartiallySetup(accountData?.state);
                return accountData?.type === requiredAccountType && !isPartiallySetup;
            })
            .map(mapItem);
    };

    return {
        chatReport,
        reportID,
        policyIDKey,
        isExpenseReport,
        isInvoiceReport,
        hasActivatedWallet,
        canUseWallet,
        canUseBusinessBankAccount,
        canUsePersonalBankAccount,
        isPersonalOnlyOption,
        hasSinglePolicy,
        hasMultiplePolicies,
        showPayViaExpensifyOptions,
        isPayInvoiceViaExpensifyBetaEnabled,
        shouldShowPayWithExpensifyOption,
        shouldShowPayElsewhereOption,
        formattedPaymentMethods,
        personalBankAccountList,
        businessBankAccountOptionList,
        activeAdminPolicies,
        paymentMethods,
        bankAccountList,
        getFilteredBankItems,
    };
}

export default useSettlementData;
export type {UseSettlementDataProps};
