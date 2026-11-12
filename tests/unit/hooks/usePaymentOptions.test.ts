import {renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import useLocalize from '@hooks/useLocalize';
import usePaymentOptions from '@hooks/usePaymentOptions';

import useSettlementButtonPaymentMethods from '@libs/SettlementButtonUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

describe('usePaymentOptions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('matches header payment labels without repeating the expense amount', async () => {
        // Given a nonzero expense amount that is already displayed by the parent Pay action
        const formattedAmount = '$50.00';

        // When the header and selection menus build their payment options
        const {result} = renderHook(
            () => {
                const {translate} = useLocalize();
                return {
                    options: usePaymentOptions({iouReport: {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE}, policyID: '1', formattedAmount, onPress: jest.fn()}),
                    headerOptions: useSettlementButtonPaymentMethods(false, translate),
                };
            },
            {wrapper: LocaleContextProvider},
        );
        await waitForBatchedUpdatesWithAct();

        // Then both menus use the same concise labels, regardless of the amount
        const businessOption = result.current.options.find((option) => option.value === CONST.IOU.PAYMENT_TYPE.VBBA);
        const elsewhereOption = result.current.options.find((option) => option.value === CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
        expect(businessOption?.text).toBe('Pay with business account');
        expect(elsewhereOption?.text).toBe('Mark as paid');
        expect(businessOption?.text).toBe(result.current.headerOptions[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT].text);
        expect(elsewhereOption?.text).toBe(result.current.headerOptions[CONST.IOU.PAYMENT_TYPE.ELSEWHERE].text);
    });

    it('preserves the amount in invoice payment categories', async () => {
        // Given an invoice whose payment category intentionally includes the amount
        const formattedAmount = '$50.00';

        // When invoice payment options are built
        const {result} = renderHook(
            () => usePaymentOptions({iouReport: {reportID: '1', type: CONST.REPORT.TYPE.INVOICE}, policyID: '1', formattedAmount, onPress: jest.fn()}),
            {wrapper: LocaleContextProvider},
        );
        await waitForBatchedUpdatesWithAct();

        // Then the invoice category keeps its amount while its submenu stays concise
        expect(result.current).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    text: 'Pay $50.00 as a business',
                    subMenuItems: expect.arrayContaining([expect.objectContaining({text: 'Mark as paid'})]),
                }),
            ]),
        );
    });
});
