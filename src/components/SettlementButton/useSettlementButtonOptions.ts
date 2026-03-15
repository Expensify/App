import truncate from 'lodash/truncate';
import type {GestureResponderEvent} from 'react-native';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {ContinueActionParams, PaymentMethod} from '@components/KYCWall/types';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSettlementData from '@hooks/useSettlementData';
import {getLastPolicyBankAccountID, getLastPolicyPaymentMethod} from '@libs/actions/Search';
import {getActivePaymentType} from '@libs/PaymentUtils';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import {isBusinessInvoiceRoom, isExpenseReport as isExpenseReportUtil, isIOUReport} from '@libs/ReportUtils';
import {setPersonalBankAccountContinueKYCOnSuccess} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccount, LastPaymentMethodType, Policy as PolicyType} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type SettlementButtonProps from './types';
import useApproveAction from './useApproveAction';
import useInvoicePaymentOptions from './useInvoicePaymentOptions';
import usePaymentGuard from './usePaymentGuard';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;

type TriggerKYCFlow = (params: ContinueActionParams) => void;

type UseSettlementButtonOptionsProps = Pick<
    SettlementButtonProps,
    | 'chatReportID'
    | 'currency'
    | 'iouReport'
    | 'formattedAmount'
    | 'onPress'
    | 'policyID'
    | 'shouldHidePaymentOptions'
    | 'shouldShowApproveButton'
    | 'shouldDisableApproveButton'
    | 'shouldShowPersonalBankAccountOption'
    | 'onlyShowPayElsewhere'
    | 'shouldUseShortForm'
    | 'confirmApproval'
>;

function useSettlementButtonOptions({
    chatReportID = '',
    currency = CONST.CURRENCY.USD,
    iouReport,
    formattedAmount = '',
    onPress,
    policyID = '-1',
    shouldHidePaymentOptions = false,
    shouldShowApproveButton = false,
    shouldDisableApproveButton = false,
    shouldShowPersonalBankAccountOption = false,
    onlyShowPayElsewhere,
    shouldUseShortForm = false,
    confirmApproval,
}: UseSettlementButtonOptionsProps) {
    const data = useSettlementData({chatReportID, iouReport, policyID, currency, shouldHidePaymentOptions, shouldShowPersonalBankAccountOption});
    const {
        icons,
        translate,
        localeCompare,
        policy,
        chatReport,
        reportID,
        policyIDKey,
        isExpenseReport,
        isInvoiceReport,
        canUseWallet,
        canUsePersonalBankAccount,
        isPersonalOnlyOption,
        hasSinglePolicy,
        hasMultiplePolicies,
        isPayInvoiceViaExpensifyBetaEnabled,
        shouldShowPayWithExpensifyOption,
        shouldShowPayElsewhereOption,
        formattedPaymentMethods,
        personalBankAccountList,
        businessBankAccountOptionList,
        activeAdminPolicies,
        paymentMethods,
    } = data;

    const {isOffline} = useNetwork();

    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const lastPaymentMethod = iouReport?.type
        ? getLastPolicyPaymentMethod(policyIDKey, personalPolicyID, lastPaymentMethods, iouReport?.type as keyof LastPaymentMethodType, isIOUReport(iouReport))
        : undefined;
    const lastBankAccountID = getLastPolicyBankAccountID(policyIDKey, lastPaymentMethods, iouReport?.type as keyof LastPaymentMethodType);
    const hasPreferredPaymentMethod = !!lastPaymentMethod;
    const lastPaymentPolicy = usePolicy(lastPaymentMethod);
    const bankAccount = data.bankAccountList?.[lastBankAccountID ?? CONST.DEFAULT_NUMBER_ID];
    const hasIntentToPay = ((formattedPaymentMethods.length === 1 && isIOUReport(iouReport)) || policy?.achAccount?.state === CONST.BANK_ACCOUNT.STATE.OPEN) && !lastPaymentMethod;

    const {checkForNecessaryAction, userBillingGraceEndPeriods} = usePaymentGuard(chatReportID, reportID, policy);
    const {approveButtonOption, handleApprove} = useApproveAction({data, iouReport, formattedAmount, shouldDisableApproveButton, confirmApproval, userBillingGraceEndPeriods});
    const {buildInvoiceOptions} = useInvoicePaymentOptions({data, checkForNecessaryAction, onPress, formattedAmount, lastPaymentMethod, hasIntentToPay});

    const businessBankAccountOptions =
        isExpenseReport && businessBankAccountOptionList.length
            ? businessBankAccountOptionList.map((account) => ({...account, value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT}))
            : undefined;

    const shortFormPayElsewhereButton = {
        text: translate('iou.pay'),
        icon: icons.CheckCircle,
        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        shouldUpdateSelectedIndex: false,
    };

    let paymentButtonOptions: Array<DropdownOption<string>>;

    // Only show the Approve button if the user cannot pay the expense
    if (shouldHidePaymentOptions && shouldShowApproveButton) {
        paymentButtonOptions = [approveButtonOption];
    } else if (onlyShowPayElsewhere) {
        paymentButtonOptions = [shouldUseShortForm ? shortFormPayElsewhereButton : paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]];
    } else {
        const buttonOptions: Array<DropdownOption<string>> = [];

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        if (canUseWallet) {
            if (personalBankAccountList.length && canUsePersonalBankAccount) {
                buttonOptions.push({
                    text: translate('iou.settleWallet', ''),
                    value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                    icon: icons.Wallet,
                });
            } else if (canUsePersonalBankAccount) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]);
            }

            if (activeAdminPolicies.length === 0 && !isPersonalOnlyOption) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            }
        }

        const shouldShowBusinessBankAccountOptions = isExpenseReport && shouldShowPayWithExpensifyOption && !isPersonalOnlyOption;

        if (shouldShowBusinessBankAccountOptions) {
            if (businessBankAccountOptionList.length === 0) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            } else {
                for (const account of businessBankAccountOptionList) {
                    buttonOptions.push({
                        text: account.text,
                        icon: typeof account.icon === 'number' ? icons.Bank : account.icon,
                        additionalIconStyles: typeof account.icon === 'number' ? undefined : account.iconStyles,
                        iconWidth: typeof account.icon === 'number' ? undefined : account.iconSize,
                        iconHeight: typeof account.icon === 'number' ? undefined : account.iconSize,
                        value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                        description: account.description,
                        onSelected: () => {
                            if (checkForNecessaryAction()) {
                                return;
                            }
                            onPress({
                                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                                payAsBusiness: true,
                                methodID: account.methodID,
                                paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                            });
                        },
                    });
                }
            }
        }

        if ((hasMultiplePolicies || hasSinglePolicy) && canUseWallet && !isPersonalOnlyOption) {
            const sortedActiveAdminPolicies = sortPoliciesByName(activeAdminPolicies, localeCompare);
            for (const p of sortedActiveAdminPolicies) {
                const policyName = p.name;
                buttonOptions.push({
                    text: translate('iou.payWithPolicy', truncate(policyName, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), ''),
                    icon: icons.Building,
                    value: p.id,
                    shouldUpdateSelectedIndex: false,
                });
            }
        }

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push({
                ...paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE],
                ...(!buttonOptions.length && shouldUseShortForm ? {text: translate('iou.pay')} : {}),
            });
        }

        if (isInvoiceReport) {
            buttonOptions.push(...buildInvoiceOptions());
        }

        if (shouldShowApproveButton) {
            buttonOptions.push(approveButtonOption);
        }

        paymentButtonOptions = buttonOptions;
    }

    const selectPaymentType = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType) => {
        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            handleApprove();
            return;
        }

        if (isInvoiceReport) {
            // if user has intent to pay, we should get the only bank account information to pay the invoice.
            if (hasIntentToPay && isPayInvoiceViaExpensifyBetaEnabled) {
                const currentBankInformation = formattedPaymentMethods.at(0) as BankAccount;
                onPress({
                    paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    payAsBusiness: currentBankInformation.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                    methodID: currentBankInformation.methodID,
                    paymentMethod: currentBankInformation.accountType,
                });
                return;
            }

            const isBusinessInvoice = bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS || isBusinessInvoiceRoom(chatReport);
            if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                onPress({paymentType: iouPaymentType, payAsBusiness: isBusinessInvoice});
                return;
            }
            onPress({
                paymentType: iouPaymentType,
                payAsBusiness: isBusinessInvoice,
                methodID: lastBankAccountID,
                paymentMethod: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                policyID: policyIDKey,
            });
        } else {
            onPress({paymentType: iouPaymentType, payAsBusiness: false});
        }
    };

    const selectPaymentMethod = (event: KYCFlowEvent, paymentType: string, triggerKYCFlow: TriggerKYCFlow, paymentMethod?: PaymentMethod, selectedPolicy?: PolicyType) => {
        triggerKYCFlow({
            event,
            iouPaymentType: paymentType as PaymentMethodType,
            paymentMethod,
            policy: selectedPolicy ?? (event ? lastPaymentPolicy : undefined),
        });
        if (paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
            setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
        }
    };

    const handlePaymentSelection = (event: GestureResponderEvent | KeyboardEvent | undefined, selectedOption: string, triggerKYCFlow: (params: ContinueActionParams) => void) => {
        if (checkForNecessaryAction()) {
            return;
        }

        const {paymentType, policyFromPaymentMethod, policyFromContext, shouldSelectPaymentMethod} = getActivePaymentType(
            selectedOption,
            activeAdminPolicies,
            businessBankAccountOptions,
            policyIDKey,
        );
        const isPayingWithMethod = paymentType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE;

        if ((!!policyFromPaymentMethod || shouldSelectPaymentMethod) && (isPayingWithMethod || !!policyFromPaymentMethod)) {
            selectPaymentMethod(event, paymentType, triggerKYCFlow, selectedOption as PaymentMethod, policyFromPaymentMethod ?? policyFromContext);
            return;
        }

        selectPaymentType(event, selectedOption as PaymentMethodType);
    };

    let customText: string;
    if (shouldUseShortForm) {
        customText = translate('iou.pay');
    } else if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
        customText = translate('iou.payElsewhere', formattedAmount);
    } else {
        customText = translate('iou.settlePayment', formattedAmount);
    }

    let secondaryTextRaw: string | undefined;
    if (
        shouldUseShortForm ||
        lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE ||
        (paymentButtonOptions.length === 1 && paymentButtonOptions.every((option) => option.value === CONST.IOU.PAYMENT_TYPE.ELSEWHERE)) ||
        (shouldHidePaymentOptions && (shouldShowApproveButton || onlyShowPayElsewhere))
    ) {
        secondaryTextRaw = undefined;
    } else if (lastPaymentPolicy) {
        secondaryTextRaw = lastPaymentPolicy.name;
    } else {
        const bankAccountToDisplay = hasIntentToPay
            ? ((formattedPaymentMethods.find((method) => method.methodID === policy?.achAccount?.bankAccountID) ?? formattedPaymentMethods.at(0)) as BankAccount)
            : bankAccount;

        // Handle bank account payments first (expense reports require bank account, never wallet)
        if ((lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.VBBA || (hasIntentToPay && isExpenseReport)) && !!policy?.achAccount) {
            if (policy?.achAccount?.accountNumber) {
                secondaryTextRaw = translate('paymentMethodList.bankAccountLastFour', policy?.achAccount?.accountNumber?.slice(-4));
            } else if (bankAccountToDisplay?.accountData?.accountNumber) {
                secondaryTextRaw = translate('paymentMethodList.bankAccountLastFour', bankAccountToDisplay?.accountData?.accountNumber?.slice(-4));
            }
            // Handle wallet payments for IOUs and bank account display for invoices
        } else if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || (hasIntentToPay && isInvoiceReport)) {
            if (isInvoiceReport) {
                const isBusinessBankAccount = bankAccountToDisplay?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS;
                secondaryTextRaw = translate(
                    isBusinessBankAccount ? 'iou.invoiceBusinessBank' : 'iou.invoicePersonalBank',
                    bankAccountToDisplay?.accountData?.accountNumber?.slice(-4) ?? '',
                );
            } else if (personalBankAccountList.length) {
                secondaryTextRaw = translate('common.wallet');
            }
        } else if (bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && bankAccount?.methodID === policy?.achAccount?.bankAccountID && isExpenseReportUtil(iouReport)) {
            secondaryTextRaw = translate('paymentMethodList.bankAccountLastFour', bankAccount?.accountData?.accountNumber?.slice(-4) ?? '');
        }
    }
    const secondaryText = truncate(secondaryTextRaw, {length: CONST.FORM_CHARACTER_LIMIT});

    const defaultSelectedIndex = paymentButtonOptions.findIndex((paymentOption) => {
        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            return paymentOption.value === CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
        }

        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.VBBA && businessBankAccountOptionList.length) {
            return paymentOption.value === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT;
        }

        if (lastPaymentPolicy?.id) {
            return paymentOption.value === lastPaymentPolicy.id;
        }

        return false;
    });

    const shouldUseSplitButton = hasPreferredPaymentMethod || !!lastPaymentPolicy || ((isExpenseReport || isInvoiceReport) && hasIntentToPay);
    const shouldLimitWidth = shouldUseShortForm && shouldUseSplitButton && !paymentButtonOptions.length;
    const shouldPopoverUseScrollView =
        paymentButtonOptions.length >= CONST.DROPDOWN_SCROLL_THRESHOLD || paymentButtonOptions.some((option) => (option.subMenuItems?.length ?? 0) >= CONST.DROPDOWN_SCROLL_THRESHOLD);

    return {
        paymentButtonOptions,
        customText,
        secondaryText,
        defaultSelectedIndex,
        shouldUseSplitButton,
        shouldLimitWidth,
        shouldPopoverUseScrollView,
        handlePaymentSelection,
        isExpenseReport,
        isInvoiceReport,
        isOffline,
        lastPaymentPolicy,
        styles: data.styles,
        translate,
        onPress,
    };
}

export default useSettlementButtonOptions;
