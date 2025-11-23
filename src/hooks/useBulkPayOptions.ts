import truncate from 'lodash/truncate';
import {useCallback, useMemo} from 'react';
import type {TupleToUnion} from 'type-fest';
// eslint-disable-next-line no-restricted-imports
import {Bank, Cash, Wallet} from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {BankAccountMenuItem} from '@components/Search/types';
import {isCurrencySupportedForDirectReimbursement} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {
    getBankAccountRoute,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport as isIOUReportUtil,
} from '@libs/ReportUtils';
import {getSettlementButtonPaymentMethods} from '@libs/SettlementButtonUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountData, Policy} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';
import useThemeStyles from './useThemeStyles';

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

type UseBulkPayOptionProps = {
    selectedPolicyID: string | undefined;
    selectedReportID: string | undefined;
    lastPaymentMethod?: string | undefined;
    activeAdminPolicies: Policy[];
    isCurrencySupportedWallet?: boolean;
    currency: string | undefined;
    formattedAmount: string;
};

type UseBulkPayOptionReturnType = {
    bulkPayButtonOptions: PopoverMenuItem[] | undefined;
    latestBankItems: BankAccountMenuItem[] | undefined;
};

/**
 * Returns the payment options for the selected reports or transactions when they are being paid for the first time.
 */
function useBulkPayOptions({
    selectedPolicyID,
    selectedReportID,
    activeAdminPolicies,
    isCurrencySupportedWallet,
    currency,
    formattedAmount,
}: UseBulkPayOptionProps): UseBulkPayOptionReturnType {
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'User'] as const);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountID} = useCurrentUserPersonalDetails();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const policy = usePolicy(selectedPolicyID);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`, {canBeMissing: true});
    const isIOUReport = isIOUReportUtil(selectedReportID);
    const isExpenseReport = isExpenseReportUtil(selectedReportID);
    const isInvoiceReport = isInvoiceReportUtil(selectedReportID);
    const shouldShowPayElsewhereOption = !isInvoiceReport;
    const canUseBusinessBankAccount = isExpenseReport || (isIOUReport && selectedReportID && !hasRequestFromCurrentAccount(selectedReportID, accountID ?? CONST.DEFAULT_NUMBER_ID));
    const canUsePersonalBankAccount = isIOUReport;
    const isPersonalOnlyOption = canUsePersonalBankAccount && !canUseBusinessBankAccount;
    const shouldShowBusinessBankAccountOptions = isExpenseReport && !isPersonalOnlyOption;
    const formattedPaymentMethods = formatPaymentMethods(bankAccountList ?? {}, fundList ?? {}, styles, translate);
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

    const getPaymentSubitems = useCallback(
        (payAsBusiness: boolean) => {
            const requiredAccountType = payAsBusiness ? CONST.BANK_ACCOUNT.TYPE.BUSINESS : CONST.BANK_ACCOUNT.TYPE.PERSONAL;

            return formattedPaymentMethods
                .filter((method) => {
                    const accountData = method?.accountData as AccountData;
                    return accountData?.type === requiredAccountType;
                })
                .map((formattedPaymentMethod) => ({
                    text: formattedPaymentMethod?.title ?? '',
                    description: formattedPaymentMethod?.description ?? '',
                    icon: formattedPaymentMethod?.icon,
                    shouldUpdateSelectedIndex: true,
                    iconStyles: formattedPaymentMethod?.iconStyles,
                    iconHeight: formattedPaymentMethod?.iconSize,
                    iconWidth: formattedPaymentMethod?.iconSize,
                    key: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    additionalData: {
                        payAsBusiness,
                        methodID: formattedPaymentMethod.methodID,
                        paymentMethod: formattedPaymentMethod.accountType,
                    },
                }));
        },
        [formattedPaymentMethods],
    );

    const latestBankItems = getLatestBankAccountItem();
    const personalBankAccountList = formattedPaymentMethods.filter((ba) => (ba.accountData as AccountData)?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL);

    const bulkPayButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const paymentMethods = getSettlementButtonPaymentMethods(icons, hasActivatedWallet, translate);

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
                    key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
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
            for (const activePolicy of activeAdminPolicies) {
                const policyName = activePolicy.name;
                buttonOptions.push({
                    text: translate('iou.payWithPolicy', {policyName: truncate(policyName, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), formattedAmount: ''}),
                    icon: icons.Building,
                    key: activePolicy.id,
                    shouldUpdateSelectedIndex: false,
                });
            }
        }

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }

        if (isInvoiceReport) {
            const isCurrencySupported = isCurrencySupportedForDirectReimbursement(currency as CurrencyType);
            const getInvoicesOptions = (payAsBusiness: boolean) => {
                const addBankAccountItem = {
                    text: translate('bankAccount.addBankAccount'),
                    icon: Bank,
                    onSelected: () => {
                        const bankAccountRoute = getBankAccountRoute(chatReport);
                        Navigation.navigate(bankAccountRoute);
                    },
                };
                return [
                    ...(isCurrencySupported ? getPaymentSubitems(payAsBusiness) : []),
                    ...(isCurrencySupported ? [addBankAccountItem] : []),
                    {
                        text: translate('iou.payElsewhere', {formattedAmount: ''}),
                        icon: Cash,
                        key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        additionalData: {
                            payAsBusiness,
                        },
                    },
                ];
            };

            if (isIndividualInvoiceRoomUtil(chatReport)) {
                buttonOptions.push({
                    text: translate('iou.settlePersonal', {formattedAmount}),
                    icon: icons.User,
                    backButtonText: translate('iou.individual'),
                    subMenuItems: getInvoicesOptions(false),
                });
                buttonOptions.push({
                    text: translate('iou.settleBusiness', {formattedAmount}),
                    icon: icons.Building,
                    backButtonText: translate('iou.business'),
                    subMenuItems: getInvoicesOptions(true),
                });
            } else {
                // If there is pay as business option, we should show the submenu items instead.
                buttonOptions.push(...getInvoicesOptions(true));
            }
        }

        return buttonOptions;
    }, [
        hasActivatedWallet,
        icons,
        translate,
        selectedReportID,
        selectedPolicyID,
        shouldShowBusinessBankAccountOptions,
        canUseWallet,
        hasMultiplePolicies,
        hasSinglePolicy,
        isPersonalOnlyOption,
        shouldShowPayElsewhereOption,
        isInvoiceReport,
        personalBankAccountList.length,
        canUsePersonalBankAccount,
        activeAdminPolicies,
        currency,
        chatReport,
        getPaymentSubitems,
        formattedAmount,
    ]);

    return {
        bulkPayButtonOptions,
        latestBankItems,
    };
}

export default useBulkPayOptions;
