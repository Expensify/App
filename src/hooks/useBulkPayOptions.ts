import truncate from 'lodash/truncate';
import type {TupleToUnion} from 'type-fest';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {BankAccountMenuItem} from '@components/Search/types';
import {isCurrencySupportedForGlobalReimbursement} from '@libs/actions/Policy/Policy';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {
    getBankAccountRoute,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport as isIOUReportUtil,
} from '@libs/ReportUtils';
import {useSettlementButtonPaymentMethods} from '@libs/SettlementButtonUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountData} from '@src/types/onyx';
import useActiveAdminPolicies from './useActiveAdminPolicies';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';
import useThemeStyles from './useThemeStyles';

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

type UseBulkPayOptionProps = {
    selectedPolicyID: string | undefined;
    selectedReportID: string | undefined;
    lastPaymentMethod?: string | undefined;
    isCurrencySupportedWallet?: boolean;
    currency: string | undefined;
    formattedAmount: string;
    onlyShowPayElsewhere: boolean;
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
    isCurrencySupportedWallet,
    currency,
    formattedAmount,
    onlyShowPayElsewhere,
}: UseBulkPayOptionProps): UseBulkPayOptionReturnType {
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'User', 'Bank', 'Cash', 'Wallet']);
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {accountID} = useCurrentUserPersonalDetails();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const paymentMethods = useSettlementButtonPaymentMethods(hasActivatedWallet, translate);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const policy = usePolicy(selectedPolicyID);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isPayInvoiceViaExpensifyBetaEnabled = isBetaEnabled(CONST.BETAS.PAY_INVOICE_VIA_EXPENSIFY);
    const activeAdminPolicies = useActiveAdminPolicies();
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
                icon: typeof icon === 'number' ? icons.Bank : icon,
                methodID,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            };
        });
    }

    const getPaymentSubItems = (payAsBusiness: boolean) => {
        const requiredAccountType = payAsBusiness ? CONST.BANK_ACCOUNT.TYPE.BUSINESS : CONST.BANK_ACCOUNT.TYPE.PERSONAL;
        return formattedPaymentMethods
            .filter((method) => {
                const accountData = method?.accountData as AccountData;
                const isPartiallySetup = isBankAccountPartiallySetup(accountData?.state);
                return accountData?.type === requiredAccountType && !isPartiallySetup;
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
    };

    const latestBankItems = getLatestBankAccountItem();
    const personalBankAccountList = formattedPaymentMethods.filter((ba) => (ba.accountData as AccountData)?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL);

    let bulkPayButtonOptions;
    if (!selectedReportID || !selectedPolicyID) {
        bulkPayButtonOptions = undefined;
    } else if (onlyShowPayElsewhere) {
        bulkPayButtonOptions = [paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]];
    } else {
        bulkPayButtonOptions = [];

        if (shouldShowBusinessBankAccountOptions) {
            bulkPayButtonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
        }

        if (canUseWallet) {
            if (personalBankAccountList.length && canUsePersonalBankAccount) {
                bulkPayButtonOptions.push({
                    text: translate('iou.settleWallet', ''),
                    key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                    icon: icons.Wallet,
                });
            } else if (canUsePersonalBankAccount) {
                bulkPayButtonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]);
            }

            if (activeAdminPolicies.length === 0 && !isPersonalOnlyOption) {
                bulkPayButtonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            }
        }

        if ((hasMultiplePolicies || hasSinglePolicy) && canUseWallet && !isPersonalOnlyOption) {
            const sortedActiveAdminPolicies = sortPoliciesByName(activeAdminPolicies, localeCompare);
            for (const activePolicy of sortedActiveAdminPolicies) {
                const policyName = activePolicy.name;
                bulkPayButtonOptions.push({
                    text: translate('iou.payWithPolicy', truncate(policyName, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), ''),
                    icon: icons.Building,
                    key: activePolicy.id,
                    shouldUpdateSelectedIndex: false,
                });
            }
        }

        if (shouldShowPayElsewhereOption) {
            bulkPayButtonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }

        if (isInvoiceReport) {
            const showPayViaExpensifyOptions = isPayInvoiceViaExpensifyBetaEnabled && isCurrencySupportedForGlobalReimbursement(currency as CurrencyType);
            const getInvoicesOptions = (payAsBusiness: boolean) => {
                const addBankAccountItem = {
                    text: translate('bankAccount.addBankAccount'),
                    icon: icons.Bank,
                    onSelected: () => {
                        const bankAccountRoute = getBankAccountRoute(chatReport);
                        Navigation.navigate(bankAccountRoute);
                    },
                };
                return [
                    ...(showPayViaExpensifyOptions ? getPaymentSubItems(payAsBusiness) : []),
                    ...(showPayViaExpensifyOptions ? [addBankAccountItem] : []),
                    {
                        text: translate('iou.payElsewhere', ''),
                        icon: icons.Cash,
                        key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        additionalData: {
                            payAsBusiness,
                        },
                    },
                ];
            };

            if (isIndividualInvoiceRoomUtil(chatReport)) {
                bulkPayButtonOptions.push({
                    text: translate('iou.settlePersonal', formattedAmount),
                    icon: icons.User,
                    backButtonText: translate('iou.individual'),
                    subMenuItems: getInvoicesOptions(false),
                });
                bulkPayButtonOptions.push({
                    text: translate('iou.settleBusiness', formattedAmount),
                    icon: icons.Building,
                    backButtonText: translate('iou.business'),
                    subMenuItems: getInvoicesOptions(true),
                });
            } else {
                // If there is pay as business option, we should show the submenu items instead.
                bulkPayButtonOptions.push(...getInvoicesOptions(true));
            }
        }
    }

    return {
        bulkPayButtonOptions,
        latestBankItems,
    };
}

export default useBulkPayOptions;
