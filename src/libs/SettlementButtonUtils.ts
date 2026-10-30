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
        },
        [CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]: {
            text: translate('iou.settleBusiness', ''),
            icon: icons.Building,
            value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            shouldUpdateSelectedIndex: false,
            key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
        },
        [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
            text: translate('iou.payElsewhere', ''),
            icon: icons.CheckCircle,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            shouldUpdateSelectedIndex: false,
            key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        },
        [CONST.PAYMENT_METHODS.ABA]: {
            text: translate('iou.payViaABA'),
            icon: icons.Paycheck,
            value: CONST.PAYMENT_METHODS.ABA,
            shouldUpdateSelectedIndex: false,
            key: CONST.PAYMENT_METHODS.ABA,
        },
    };

    return paymentMethods;
};

export default useSettlementButtonPaymentMethods;
