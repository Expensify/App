import {useEffect, useMemo, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import * as Expensicons from '@components/Icon/Expensicons';
import type SettlementButtonProps from '@components/SettlementButton/types';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import {
    doesReportBelongToWorkspace,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import {isCurrencySupportedForDirectReimbursement} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastPaymentMethodType} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

type UsePaymentOptionsProps = Pick<
    SettlementButtonProps,
    | 'addBankAccountRoute'
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
    addBankAccountRoute = '',
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
}: UsePaymentOptionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // The app would crash due to subscribing to the entire report collection if chatReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID || CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const policyEmployeeAccountIDs = policyID ? getPolicyEmployeeAccountIDs(policyID) : [];
    const reportBelongsToWorkspace = policyID ? doesReportBelongToWorkspace(chatReport, policyEmployeeAccountIDs, policyID) : false;
    const policyIDKey = reportBelongsToWorkspace ? policyID : CONST.POLICY.ID_FAKE;
    const [lastPaymentMethod, lastPaymentMethodResult] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
        canBeMissing: true,
        selector: (paymentMethod) => {
            if (typeof paymentMethod?.[policyIDKey] === 'string') {
                return paymentMethod?.[policyIDKey];
            }
            if (typeof (paymentMethod?.[policyIDKey] as LastPaymentMethodType)?.lastUsed === 'string') {
                return (paymentMethod?.[policyIDKey] as LastPaymentMethodType).lastUsed;
            }
            return (paymentMethod?.[policyIDKey] as LastPaymentMethodType)?.lastUsed.name;
        },
    });
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');

    const isLoadingLastPaymentMethod = isLoadingOnyxValue(lastPaymentMethodResult);
    const [bankAccountList = {}] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [fundList = {}] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const lastPaymentMethodRef = useRef(lastPaymentMethod);

    useEffect(() => {
        if (isLoadingLastPaymentMethod) {
            return;
        }
        lastPaymentMethodRef.current = lastPaymentMethod;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isLoadingLastPaymentMethod]);

    const isInvoiceReport = (!isEmptyObject(iouReport) && isInvoiceReportUtil(iouReport)) || false;
    const shouldShowPayWithExpensifyOption = !shouldHidePaymentOptions;
    const shouldShowPayElsewhereOption = !shouldHidePaymentOptions && !isInvoiceReport;
    const paymentButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const isExpenseReport = isExpenseReportUtil(iouReport);
        const paymentMethods = {
            [CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]: {
                text: hasActivatedWallet ? translate('iou.settleWallet', {formattedAmount: ''}) : translate('iou.settlePersonal', {formattedAmount: ''}),
                icon: Expensicons.User,
                value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                shouldUpdateSelectedIndex: false,
            },
            [CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]: {
                text: translate('iou.settleBusiness', {formattedAmount: ''}),
                icon: Expensicons.Building,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                shouldUpdateSelectedIndex: false,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere', {formattedAmount}),
                icon: Expensicons.Cash,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
        const approveButtonOption = {
            text: translate('iou.approve', {formattedAmount}),
            icon: Expensicons.ThumbsUp,
            value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
            disabled: !!shouldDisableApproveButton,
        };
        const canUseWallet = !isExpenseReport && !isInvoiceReport && currency === CONST.CURRENCY.USD;

        // Only show the Approve button if the user cannot pay the expense
        if (shouldHidePaymentOptions && shouldShowApproveButton) {
            return [approveButtonOption];
        }

        if (onlyShowPayElsewhere) {
            return [paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]];
        }

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        if (canUseWallet) {
            buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]);
        }
        if (isExpenseReport && shouldShowPayWithExpensifyOption) {
            buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
        }
        if (shouldShowPayElsewhereOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }

        if (isInvoiceReport) {
            const formattedPaymentMethods = formatPaymentMethods(bankAccountList, fundList, styles);
            const isCurrencySupported = isCurrencySupportedForDirectReimbursement(currency as CurrencyType);
            const getPaymentSubitems = (payAsBusiness: boolean) =>
                formattedPaymentMethods.map((formattedPaymentMethod) => ({
                    text: formattedPaymentMethod?.title ?? '',
                    description: formattedPaymentMethod?.description ?? '',
                    icon: formattedPaymentMethod?.icon,
                    onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, payAsBusiness, formattedPaymentMethod.methodID, formattedPaymentMethod.accountType),
                    iconStyles: formattedPaymentMethod?.iconStyles,
                    iconHeight: formattedPaymentMethod?.iconSize,
                    iconWidth: formattedPaymentMethod?.iconSize,
                }));

            if (isIndividualInvoiceRoomUtil(chatReport)) {
                buttonOptions.push({
                    text: translate('iou.settlePersonal', {formattedAmount}),
                    icon: Expensicons.User,
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    backButtonText: translate('iou.individual'),
                    subMenuItems: [
                        ...(isCurrencySupported ? getPaymentSubitems(false) : []),
                        {
                            text: translate('iou.payElsewhere', {formattedAmount: ''}),
                            icon: Expensicons.Cash,
                            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                        },
                        {
                            text: translate('workspace.invoices.paymentMethods.addBankAccount'),
                            icon: Expensicons.Bank,
                            onSelected: () => Navigation.navigate(addBankAccountRoute),
                        },
                    ],
                });
            }

            buttonOptions.push({
                text: translate('iou.settleBusiness', {formattedAmount}),
                icon: Expensicons.Building,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                backButtonText: translate('iou.business'),
                subMenuItems: [
                    ...(isCurrencySupported ? getPaymentSubitems(true) : []),
                    {
                        text: translate('workspace.invoices.paymentMethods.addBankAccount'),
                        icon: Expensicons.Bank,
                        onSelected: () => Navigation.navigate(addBankAccountRoute),
                    },
                    {
                        text: translate('iou.payElsewhere', {formattedAmount: ''}),
                        icon: Expensicons.Cash,
                        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, true),
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
    ]);

    return paymentButtonOptions;
}

export default usePaymentOptions;
