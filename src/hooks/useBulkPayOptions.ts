import {useMemo} from 'react';
import {Bank, Building, CheckCircle, User} from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {BankAccountMenuItem} from '@components/Search/types';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {isExpenseReport as isExpenseReportUtil, isInvoiceReport as isInvoiceReportUtil, isIOUReport as isIOUReportUtil} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
};

type UseBulkPayOptionReturnType = {
    bulkPayButtonOptions: PopoverMenuItem[] | undefined;
    latestBankItems: BankAccountMenuItem[] | undefined;
};

/**
 * Returns the payment options for the selected reports or transactions when they are being paid for the first time.
 */
function useBulkPayOptions({selectedPolicyID, selectedReportID}: UseBulkPayOptionProps): UseBulkPayOptionReturnType {
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

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }
        return buttonOptions;
    }, [selectedPolicyID, selectedReportID, shouldShowBusinessBankAccountOptions, hasActivatedWallet, shouldShowPayElsewhereOption, translate]);

    return {
        bulkPayButtonOptions,
        latestBankItems,
    };
}

export default useBulkPayOptions;
