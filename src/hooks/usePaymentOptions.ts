import {useCallback, useEffect, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type SettlementButtonProps from '@components/SettlementButton/types';
import type {PaymentOrApproveOption} from '@libs/PaymentUtils';
import {getBankAccountRoute, isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastPaymentMethod} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';
import useSettlementData from './useSettlementData';

type UsePaymentOptionsProps = Pick<
    SettlementButtonProps,
    | 'currency'
    | 'iouReport'
    | 'chatReportID'
    | 'formattedAmount'
    | 'policyID'
    | 'onPress'
    | 'shouldHidePaymentOptions'
    | 'shouldShowApproveButton'
    | 'shouldDisableApproveButton'
    | 'onlyShowPayElsewhere'
>;

/**
 * Configures and returns payment options based on the context of the IOU report and user settings.
 * It considers various conditions such as whether to show payment methods or an approval button, report types, and user preferences on payment methods.
 * It dynamically generates payment or approval options to ensure the user interface reflects the correct actions possible for the user's current situation.
 */
function usePaymentOptions({
    currency = CONST.CURRENCY.USD,
    iouReport,
    chatReportID = '',
    formattedAmount = '',
    policyID = '-1',
    onPress,
    shouldHidePaymentOptions = false,
    shouldShowApproveButton = false,
    shouldDisableApproveButton = false,
    onlyShowPayElsewhere,
}: UsePaymentOptionsProps): PaymentOrApproveOption[] {
    const data = useSettlementData({chatReportID, iouReport, policyID, currency, shouldHidePaymentOptions, shouldUseFakePolicyFallback: true});
    const {
        icons,
        translate,
        chatReport,
        policyIDKey,
        isExpenseReport,
        isInvoiceReport,
        hasActivatedWallet,
        canUseWallet,
        showPayViaExpensifyOptions,
        shouldShowPayWithExpensifyOption,
        shouldShowPayElsewhereOption,
        getFilteredBankItems,
    } = data;

    const lastPaymentMethodSelector = useCallback(
        (paymentMethod: OnyxEntry<LastPaymentMethod>) => {
            const paymentMethodType = paymentMethod?.[policyIDKey];
            if (typeof paymentMethodType === 'string') {
                return paymentMethodType;
            }
            if (typeof paymentMethodType?.lastUsed === 'string') {
                return paymentMethodType.lastUsed;
            }
            return paymentMethodType?.lastUsed.name;
        },
        [policyIDKey],
    );
    const [lastPaymentMethod, lastPaymentMethodResult] = useOnyx(
        ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
        {
            selector: lastPaymentMethodSelector,
        },
        [lastPaymentMethodSelector],
    );

    const isLoadingLastPaymentMethod = isLoadingOnyxValue(lastPaymentMethodResult);
    const lastPaymentMethodRef = useRef(lastPaymentMethod);

    useEffect(() => {
        if (isLoadingLastPaymentMethod) {
            return;
        }
        lastPaymentMethodRef.current = lastPaymentMethod;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingLastPaymentMethod]);

    const paymentButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const paymentMethods = {
            [CONST.IOU.PAYMENT_TYPE.EXPENSIFY]: {
                text: hasActivatedWallet ? translate('iou.settleWallet', '') : translate('iou.settlePersonal', ''),
                icon: icons.User,
                value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            },
            [CONST.IOU.PAYMENT_TYPE.VBBA]: {
                text: translate('iou.settleBusiness', formattedAmount),
                icon: icons.Building,
                value: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere', formattedAmount),
                icon: icons.CheckCircle,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
        const approveButtonOption = {
            text: translate('iou.approve', {formattedAmount}),
            icon: icons.ThumbsUp,
            value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
            disabled: !!shouldDisableApproveButton,
        };

        // Only show the Approve button if the user cannot pay the expense
        if (shouldHidePaymentOptions && shouldShowApproveButton) {
            return [approveButtonOption];
        }

        if (onlyShowPayElsewhere) {
            return [paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]];
        }

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        if (canUseWallet) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.EXPENSIFY]);
        }
        if (isExpenseReport && shouldShowPayWithExpensifyOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.VBBA]);
        }
        if (shouldShowPayElsewhereOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }

        if (isInvoiceReport) {
            const getPaymentSubItems = (payAsBusiness: boolean) => {
                return getFilteredBankItems(payAsBusiness, (formattedPaymentMethod) => ({
                    text: formattedPaymentMethod?.title ?? '',
                    description: formattedPaymentMethod?.description ?? '',
                    icon: formattedPaymentMethod?.icon,
                    onSelected: () =>
                        onPress({
                            paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                            payAsBusiness,
                            methodID: formattedPaymentMethod.methodID,
                            paymentMethod: formattedPaymentMethod.accountType,
                        }),
                    iconStyles: formattedPaymentMethod?.iconStyles,
                    iconHeight: formattedPaymentMethod?.iconSize,
                    iconWidth: formattedPaymentMethod?.iconSize,
                }));
            };

            const addBankAccountItem = {
                text: translate('bankAccount.addBankAccount'),
                icon: icons.Bank,
                onSelected: () => {
                    const bankAccountRoute = getBankAccountRoute(chatReport);
                    Navigation.navigate(bankAccountRoute);
                },
            };

            if (isIndividualInvoiceRoomUtil(chatReport)) {
                buttonOptions.push({
                    text: translate('iou.settlePersonal', formattedAmount),
                    icon: icons.User,
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    backButtonText: translate('iou.individual'),
                    subMenuItems: [
                        ...(showPayViaExpensifyOptions ? getPaymentSubItems(false) : []),
                        {
                            text: translate('iou.payElsewhere', ''),
                            icon: icons.Cash,
                            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            onSelected: () => onPress({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE}),
                        },
                        ...(showPayViaExpensifyOptions ? [addBankAccountItem] : []),
                    ],
                });
            }

            buttonOptions.push({
                text: translate('iou.settleBusiness', formattedAmount),
                icon: icons.Building,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                backButtonText: translate('iou.business'),
                subMenuItems: [
                    ...(showPayViaExpensifyOptions ? getPaymentSubItems(true) : []),
                    ...(showPayViaExpensifyOptions ? [addBankAccountItem] : []),
                    {
                        text: translate('iou.payElsewhere', ''),
                        icon: icons.Cash,
                        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        onSelected: () => onPress({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, payAsBusiness: true}),
                    },
                ],
            });
        }

        if (shouldShowApproveButton) {
            buttonOptions.push(approveButtonOption);
        }

        // Put the preferred payment method to the front of the array, so it's shown as default. We assume their last payment method is their preferred.
        if (lastPaymentMethodRef.current) {
            return buttonOptions.sort((method) => (method.value === lastPaymentMethod ? -1 : 0));
        }
        return buttonOptions;
        // We don't want to reorder the options when the preferred payment method changes while the button is still visible except for component initialization when the last payment method is not initialized yet.
        // We need to be sure that onPress should be wrapped in an useCallback to prevent unnecessary updates.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isLoadingLastPaymentMethod,
        iouReport,
        translate,
        formattedAmount,
        shouldDisableApproveButton,
        isInvoiceReport,
        currency,
        shouldHidePaymentOptions,
        shouldShowApproveButton,
        shouldShowPayWithExpensifyOption,
        shouldShowPayElsewhereOption,
        chatReport,
        onPress,
        onlyShowPayElsewhere,
        icons,
    ]);

    return paymentButtonOptions;
}

export default usePaymentOptions;
