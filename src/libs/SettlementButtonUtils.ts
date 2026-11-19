import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import CONST from '@src/CONST';

/**
 * Retrieves SettlementButton payment methods.
 */
const useSettlementButtonPaymentMethods = (hasActivatedWallet: boolean, translate: LocaleContextProps['translate']) => {
    const icons = useMemoizedLazyExpensifyIcons(['User', 'Building', 'CheckCircle', 'Paycheck']);

    const paymentMethods = {
        [CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]: {
            text: hasActivatedWallet ? translate('iou.settleWallet', '') : translate('iou.settlePersonal', ''),
            icon: icons.User,
            value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            sentryLabel: CONST.SENTRY_LABEL.SETTLEMENT_BUTTON.PAYMENT_MENU.PERSONAL,
        },
        [CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]: {
            text: translate('iou.settleBusiness', ''),
            icon: icons.Building,
            value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            shouldUpdateSelectedIndex: false,
            key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            sentryLabel: CONST.SENTRY_LABEL.SETTLEMENT_BUTTON.PAYMENT_MENU.BUSINESS,
        },
        [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
            text: translate('iou.payElsewhere', ''),
            icon: icons.CheckCircle,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            shouldUpdateSelectedIndex: false,
            key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            sentryLabel: CONST.SENTRY_LABEL.SETTLEMENT_BUTTON.PAYMENT_MENU.PAY_ELSEWHERE,
        },
        [CONST.PAYMENT_METHODS.ABA]: {
            text: translate('iou.payViaABA'),
            icon: icons.Paycheck,
            value: CONST.PAYMENT_METHODS.ABA,
            shouldUpdateSelectedIndex: false,
            key: CONST.PAYMENT_METHODS.ABA,
            sentryLabel: CONST.SENTRY_LABEL.SETTLEMENT_BUTTON.PAYMENT_MENU.PAY_VIA_ABA,
        },
    };

    return paymentMethods;
};

export default useSettlementButtonPaymentMethods;
