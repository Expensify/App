import truncate from 'lodash/truncate';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {BankAccountMenuItem} from '@components/Search/types';
import Navigation from '@libs/Navigation/Navigation';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {
    getBankAccountRoute,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport as isIOUReportUtil,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import useSettlementData from './useSettlementData';

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
    businessBankAccountOptions: BankAccountMenuItem[] | undefined;
    shouldShowBusinessBankAccountOptions: boolean;
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
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`);

    const data = useSettlementData({
        chatReportID: iouReport?.chatReportID,
        iouReport: iouReport ?? undefined,
        policyID: selectedPolicyID,
        currency,
    });
    const {
        icons,
        translate,
        localeCompare,
        accountID,
        chatReport,
        personalBankAccountList,
        businessBankAccountOptionList,
        activeAdminPolicies,
        paymentMethods,
        showPayViaExpensifyOptions,
        getFilteredBankItems,
    } = data;

    const isIOUReport = isIOUReportUtil(selectedReportID);
    const isExpenseReport = isExpenseReportUtil(selectedReportID);
    const isInvoiceReport = isInvoiceReportUtil(selectedReportID);
    const shouldShowPayElsewhereOption = !isInvoiceReport;
    const canUseBusinessBankAccount = isExpenseReport || (isIOUReport && !!selectedReportID && !hasRequestFromCurrentAccount(selectedReportID, accountID ?? CONST.DEFAULT_NUMBER_ID));
    const canUsePersonalBankAccount = isIOUReport;
    const isPersonalOnlyOption = canUsePersonalBankAccount && !canUseBusinessBankAccount;
    const shouldShowBusinessBankAccountOptions = isExpenseReport && !isPersonalOnlyOption;
    const canUseWallet = !isExpenseReport && !isInvoiceReport && !!isCurrencySupportedWallet;
    const hasSinglePolicy = !isExpenseReport && activeAdminPolicies.length === 1;
    const hasMultiplePolicies = !isExpenseReport && activeAdminPolicies.length > 1;

    const getPaymentSubItems = (payAsBusiness: boolean) => {
        return getFilteredBankItems(payAsBusiness, (formattedPaymentMethod) => ({
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
                bankAccountID: formattedPaymentMethod.methodID,
                paymentMethod: formattedPaymentMethod.accountType,
            },
        }));
    };

    const businessBankAccountOptions =
        shouldShowBusinessBankAccountOptions && businessBankAccountOptionList.length
            ? businessBankAccountOptionList.map((account) => ({
                  text: account.text,
                  description: account.description,
                  icon: account.icon,
                  methodID: account.methodID,
                  value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
              }))
            : undefined;

    let bulkPayButtonOptions;
    if (!selectedReportID || !selectedPolicyID) {
        bulkPayButtonOptions = undefined;
    } else if (onlyShowPayElsewhere) {
        bulkPayButtonOptions = [paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]];
    } else {
        bulkPayButtonOptions = [];

        if (shouldShowBusinessBankAccountOptions) {
            if (businessBankAccountOptionList.length === 0) {
                bulkPayButtonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            } else {
                for (const account of businessBankAccountOptionList) {
                    bulkPayButtonOptions.push({
                        text: account.text,
                        description: account.description,
                        icon: typeof account.icon === 'number' ? icons.Bank : account.icon,
                        iconStyles: account.iconStyles,
                        iconWidth: typeof account.icon === 'number' ? undefined : account.iconSize,
                        iconHeight: typeof account.icon === 'number' ? undefined : account.iconSize,
                        key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                        shouldIgnoreKeyForRendering: true,
                        additionalData: {
                            bankAccountID: account.methodID,
                            paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                        },
                    });
                }
            }
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
        businessBankAccountOptions,
        shouldShowBusinessBankAccountOptions,
    };
}

export default useBulkPayOptions;
