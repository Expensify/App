import truncate from 'lodash/truncate';
import {useMemo} from 'react';
import {Bank, Building, CheckCircle, User, Wallet} from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {BankAccountMenuItem} from '@components/Search/types';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {isExpenseReport as isExpenseReportUtil, isInvoiceReport as isInvoiceReportUtil, isIOUReport as isIOUReportUtil} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountData, Policy} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';
import useThemeStyles from './useThemeStyles';

type UseBulkPayOptionProps = {
    selectedPolicyID: string | undefined;
    selectedReportID: string | undefined;
    lastPaymentMethod?: string | undefined;
    onPress?: (paymentType: PaymentMethodType | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod | undefined, policyID?: string) => void;
    activeAdminPolicies: Policy[];
    isCurrencySupportedWallet?: boolean;
};

type UseBulkPayOptionReturnType = {
    bulkPayButtonOptions: PopoverMenuItem[] | undefined;
    latestBankItems: BankAccountMenuItem[] | undefined;
};

/**
 * Returns the payment options for the selected reports or transactions when they are being paid for the first time.
 */
function useBulkPayOptions({selectedPolicyID, selectedReportID, activeAdminPolicies, isCurrencySupportedWallet}: UseBulkPayOptionProps): UseBulkPayOptionReturnType {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountID} = useCurrentUserPersonalDetails();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const policy = usePolicy(selectedPolicyID);

    const isIOUReport = isIOUReportUtil(selectedReportID);
    const isExpenseReport = isExpenseReportUtil(selectedReportID);
    const isInvoiceReport = isInvoiceReportUtil(selectedReportID);
    const shouldShowPayElsewhereOption = !isInvoiceReport;
    const canUseBusinessBankAccount = isExpenseReport || (isIOUReport && selectedReportID && !hasRequestFromCurrentAccount(selectedReportID, accountID ?? CONST.DEFAULT_NUMBER_ID));
    const canUsePersonalBankAccount = isIOUReport;
    const isPersonalOnlyOption = canUsePersonalBankAccount && !canUseBusinessBankAccount;
    const shouldShowBusinessBankAccountOptions = isExpenseReport && !isPersonalOnlyOption;
    const formattedPaymentMethods = formatPaymentMethods(bankAccountList ?? {}, fundList ?? {}, styles);
    const canUseWallet = !isExpenseReport && !isInvoiceReport && isCurrencySupportedWallet;
    const hasSinglePolicy = !isExpenseReport && activeAdminPolicies.length === 1;
    const hasMultiplePolicies = !isExpenseReport && activeAdminPolicies.length > 1;

    function getLatestBankAccountItem() {
        if (!policy?.achAccount?.bankAccountID) {
            return;
        }
        const policyBankAccounts = formattedPaymentMethods.filter((method) => method.methodID === policy?.achAccount?.bankAccountID);

        return policyBankAccounts.map((formattedPaymentMethod) => {
            const {icon, title, description, methodID} = formattedPaymentMethod ?? {};

            return {
                text: title ?? '',
                description: description ?? '',
                icon: typeof icon === 'number' ? Bank : icon,
                methodID,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            };
        });
    }

    const latestBankItems = getLatestBankAccountItem();
    const personalBankAccountList = formattedPaymentMethods.filter((ba) => (ba.accountData as AccountData)?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL);

    const bulkPayButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const paymentMethods = {
            [CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]: {
                text: hasActivatedWallet ? translate('iou.settleWallet', {formattedAmount: ''}) : translate('iou.settlePersonal', {formattedAmount: ''}),
                icon: User,
                key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            },
            [CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]: {
                text: translate('iou.settleBusiness', {formattedAmount: ''}),
                icon: Building,
                key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere', {formattedAmount: ''}),
                icon: CheckCircle,
                key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };

        if (!selectedReportID || !selectedPolicyID) {
            return undefined;
        }

        if (shouldShowBusinessBankAccountOptions) {
            buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
        }

        if (canUseWallet) {
            if (personalBankAccountList.length && canUsePersonalBankAccount) {
                buttonOptions.push({
                    text: translate('iou.settleWallet', {formattedAmount: ''}),
                    value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                    icon: Wallet,
                });
            } else if (canUsePersonalBankAccount) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]);
            }

            if (activeAdminPolicies.length === 0 && !isPersonalOnlyOption) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            }
        }

        if ((hasMultiplePolicies || hasSinglePolicy) && canUseWallet && !isPersonalOnlyOption) {
            activeAdminPolicies.forEach((activePolicy) => {
                const policyName = activePolicy.name;
                buttonOptions.push({
                    text: translate('iou.payWithPolicy', {policyName: truncate(policyName, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), formattedAmount: ''}),
                    icon: Building,
                    value: activePolicy.id,
                    shouldUpdateSelectedIndex: false,
                });
            });
        }

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }
        return buttonOptions;
    }, [
        hasActivatedWallet,
        translate,
        selectedReportID,
        selectedPolicyID,
        shouldShowBusinessBankAccountOptions,
        canUseWallet,
        hasMultiplePolicies,
        hasSinglePolicy,
        isPersonalOnlyOption,
        shouldShowPayElsewhereOption,
        personalBankAccountList.length,
        canUsePersonalBankAccount,
        activeAdminPolicies,
    ]);

    return {
        bulkPayButtonOptions,
        latestBankItems,
    };
}

export default useBulkPayOptions;
