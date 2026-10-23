import {renderHook} from '@testing-library/react-native';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import useSettlementButtonPaymentMethods from '@libs/SettlementButtonUtils';

import CONST from '@src/CONST';

const mockTranslate = jest.fn((key: string) => key);

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: mockTranslate,
    }),
}));

describe('useSettlementButtonPaymentMethods', () => {
    const {translate} = useLocalize();
    const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['User', 'Building', 'CheckCircle', 'Paycheck']));

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return payment method with wallet for PERSONAL_BANK_ACCOUNT when hasActivatedWallet is true', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(result.current[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settleWallet', ''),
            icon: icons.current.User,
            value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        });
    });

    it('should return payment method with personal bank account for PERSONAL_BANK_ACCOUNT when hasActivatedWallet is false', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(false, translate));
        expect(result.current[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settlePersonal', ''),
            icon: icons.current.User,
            value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        });
    });

    it('should return payment method with business bank account for BUSINESS_BANK_ACCOUNT', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(result.current[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settleBusiness', ''),
            icon: icons.current.Building,
            value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            shouldUpdateSelectedIndex: false,
            key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
        });
    });

    it('should return payment method elsewhere for ELSEWHERE', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(result.current[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]).toEqual({
            text: translate('iou.payElsewhere', ''),
            icon: icons.current.CheckCircle,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            shouldUpdateSelectedIndex: false,
            key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        });
    });

    it('should return payment method via ABA for ABA', () => {
        // Given the settlement button's payment methods
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));

        // When looking up the ABA one
        const paymentMethod = result.current[CONST.PAYMENT_METHODS.ABA];

        // Then it shows as "Pay via ABA" and doesn't change the selected option (like the other non-wallet options)
        expect(paymentMethod).toEqual({
            text: translate('iou.payViaABA'),
            icon: icons.current.Paycheck,
            value: CONST.PAYMENT_METHODS.ABA,
            shouldUpdateSelectedIndex: false,
            key: CONST.PAYMENT_METHODS.ABA,
        });
    });

    it('should return all four payment methods', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(Object.keys(result.current)).toHaveLength(4);
        expect(result.current).toHaveProperty(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
        expect(result.current).toHaveProperty(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT);
        expect(result.current).toHaveProperty(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
        expect(result.current).toHaveProperty(CONST.PAYMENT_METHODS.ABA);
    });

    it.each([
        {hasActivatedWallet: true, expectedPersonalKey: 'iou.settleWallet'},
        {hasActivatedWallet: false, expectedPersonalKey: 'iou.settlePersonal'},
    ])('should use correct texts for each payment method when hasActivatedWallet is $hasActivatedWallet', ({hasActivatedWallet, expectedPersonalKey}) => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(hasActivatedWallet, translate));
        expect(translate).toHaveBeenCalledTimes(4);
        expect(translate).toHaveBeenCalledWith(expectedPersonalKey, '');
        expect(translate).toHaveBeenCalledWith('iou.settleBusiness', '');
        expect(translate).toHaveBeenCalledWith('iou.payElsewhere', '');
        expect(translate).toHaveBeenCalledWith('iou.payViaABA');
        expect(result.current[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT].text).toBe(expectedPersonalKey);
        expect(result.current[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT].text).toBe('iou.settleBusiness');
        expect(result.current[CONST.IOU.PAYMENT_TYPE.ELSEWHERE].text).toBe('iou.payElsewhere');
        expect(result.current[CONST.PAYMENT_METHODS.ABA].text).toBe('iou.payViaABA');
    });

    it.each([
        {
            method: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            expectedIcon: icons.current.User,
            expectedValue: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            description: 'PERSONAL_BANK_ACCOUNT',
        },
        {
            method: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            expectedIcon: icons.current.Building,
            expectedValue: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            description: 'BUSINESS_BANK_ACCOUNT',
        },
        {
            method: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            expectedIcon: icons.current.CheckCircle,
            expectedValue: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            description: 'ELSEWHERE',
        },
        {
            method: CONST.PAYMENT_METHODS.ABA,
            expectedIcon: icons.current.Paycheck,
            expectedValue: CONST.PAYMENT_METHODS.ABA,
            description: 'ABA',
        },
    ])('should use correct icon and value for $description regardless of hasActivatedWallet', ({method, expectedIcon, expectedValue}) => {
        const {result: resultWithWallet} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        const {result: resultWithoutWallet} = renderHook(() => useSettlementButtonPaymentMethods(false, translate));
        for (const result of [resultWithWallet.current, resultWithoutWallet.current]) {
            const paymentMethod = result[method];
            expect(paymentMethod.icon).toStrictEqual(expectedIcon);
            expect(paymentMethod.value).toStrictEqual(expectedValue);
        }
    });

    it('should set shouldUpdateSelectedIndex to false for business bank account, elsewhere and ABA payment types', () => {
        const {result} = renderHook(() => useSettlementButtonPaymentMethods(true, translate));
        expect(result.current[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).not.toHaveProperty('shouldUpdateSelectedIndex');
        expect(result.current[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT].shouldUpdateSelectedIndex).toBe(false);
        expect(result.current[CONST.IOU.PAYMENT_TYPE.ELSEWHERE].shouldUpdateSelectedIndex).toBe(false);
        expect(result.current[CONST.PAYMENT_METHODS.ABA].shouldUpdateSelectedIndex).toBe(false);
    });
});
