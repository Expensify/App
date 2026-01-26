import {useCallback, useEffect, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import type SettlementButtonProps from '@components/SettlementButton/types';
import type {PaymentOrApproveOption} from '@libs/PaymentUtils';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {getPolicyEmployeeAccountIDs} from '@libs/PolicyUtils';
import {
    doesReportBelongToWorkspace,
    getBankAccountRoute,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import {isCurrencySupportedForGlobalReimbursement} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, FundList, LastPaymentMethod} from '@src/types/onyx';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';
import useThemeStyles from './useThemeStyles';

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

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
> & {
    /** Whether this is a selected transaction action (bulk action from selection mode) */
    isSelectedTransactionAction?: boolean;
};

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
    isSelectedTransactionAction,
}: UsePaymentOptionsProps): PaymentOrApproveOption[] {
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'User', 'ThumbsUp', 'Bank', 'Wallet', 'Cash']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const {accountID} = useCurrentUserPersonalDetails();

    // The app would crash due to subscribing to the entire report collection if chatReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID || CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const [conciergeReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const policyEmployeeAccountIDs = getPolicyEmployeeAccountIDs(policy, accountID);
    const reportBelongsToWorkspace = policyID ? doesReportBelongToWorkspace(chatReport, policyEmployeeAccountIDs, policyID, conciergeReportID) : false;
    const policyIDKey = reportBelongsToWorkspace ? policyID : CONST.POLICY.ID_FAKE;
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
            canBeMissing: true,
            selector: lastPaymentMethodSelector,
        },
        [lastPaymentMethodSelector],
    );

    const isLoadingLastPaymentMethod = isLoadingOnyxValue(lastPaymentMethodResult);
    const [bankAccountList = getEmptyObject<BankAccountList>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [fundList = getEmptyObject<FundList>()] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const lastPaymentMethodRef = useRef(lastPaymentMethod);

    useEffect(() => {
        if (isLoadingLastPaymentMethod) {
            return;
        }
        lastPaymentMethodRef.current = lastPaymentMethod;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingLastPaymentMethod]);

    const isInvoiceReport = (!isEmptyObject(iouReport) && isInvoiceReportUtil(iouReport)) || false;
    const shouldShowPayWithExpensifyOption = !shouldHidePaymentOptions;
    const shouldShowPayElsewhereOption = !shouldHidePaymentOptions && !isInvoiceReport;
    const paymentButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const isExpenseReport = isExpenseReportUtil(iouReport);
        const paymentMethods = {
            [CONST.IOU.PAYMENT_TYPE.EXPENSIFY]: {
                text: hasActivatedWallet ? translate('iou.settleWallet', {formattedAmount: ''}) : translate('iou.settlePersonal', {formattedAmount: ''}),
                icon: icons.Wallet,
                value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            },
            [CONST.IOU.PAYMENT_TYPE.VBBA]: {
                text: translate('iou.settleBusiness', {formattedAmount}),
                icon: icons.Building,
                value: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere', {formattedAmount}),
                icon: icons.Cash,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
        const approveButtonOption = {
            text: translate('iou.approve', {formattedAmount}),
            icon: icons.ThumbsUp,
            value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
            disabled: !!shouldDisableApproveButton,
        };
        const canUseWallet = !isExpenseReport && !isInvoiceReport && isCurrencySupportedForGlobalReimbursement(currency as CurrencyType);

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
            const formattedPaymentMethods = formatPaymentMethods(bankAccountList, fundList, styles, translate);
            const isCurrencySupported = isCurrencySupportedForGlobalReimbursement(currency as CurrencyType);
            const getPaymentSubitems = (payAsBusiness: boolean) =>
                formattedPaymentMethods.map((formattedPaymentMethod) => ({
                    text: formattedPaymentMethod?.title ?? '',
                    description: formattedPaymentMethod?.description ?? '',
                    icon: formattedPaymentMethod?.icon,
                    onSelected: () =>
                        onPress({
                            paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                            payAsBusiness,
                            methodID: formattedPaymentMethod.methodID,
                            paymentMethod: formattedPaymentMethod.accountType,
                            isSelectedTransactionAction,
                        }),
                    iconStyles: formattedPaymentMethod?.iconStyles,
                    iconHeight: formattedPaymentMethod?.iconSize,
                    iconWidth: formattedPaymentMethod?.iconSize,
                }));

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
                    text: translate('iou.settlePersonal', {formattedAmount}),
                    icon: icons.User,
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    backButtonText: translate('iou.individual'),
                    subMenuItems: [
                        ...(isCurrencySupported ? getPaymentSubitems(false) : []),
                        {
                            text: translate('iou.payElsewhere', {formattedAmount: ''}),
                            icon: icons.Cash,
                            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            onSelected: () => onPress({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, isSelectedTransactionAction}),
                        },
                        ...(isCurrencySupported ? [addBankAccountItem] : []),
                    ],
                });
            }

            buttonOptions.push({
                text: translate('iou.settleBusiness', {formattedAmount}),
                icon: icons.Building,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                backButtonText: translate('iou.business'),
                subMenuItems: [
                    ...(isCurrencySupported ? getPaymentSubitems(true) : []),
                    ...(isCurrencySupported ? [addBankAccountItem] : []),
                    {
                        text: translate('iou.payElsewhere', {formattedAmount: ''}),
                        icon: icons.Cash,
                        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        onSelected: () => onPress({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, payAsBusiness: true, isSelectedTransactionAction}),
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
        isSelectedTransactionAction,
    ]);

    return paymentButtonOptions;
}

export default usePaymentOptions;
