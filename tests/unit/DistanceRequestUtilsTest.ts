import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import {translateLocal} from '../utils/TestHelper';

const FAKE_POLICY: Policy = {
    id: 'CEEEDB0EC660F71A',
    name: 'Test',
    role: 'admin',
    type: 'corporate',
    owner: 'work.sa1206+travel@gmail.com',
    outputCurrency: 'USD',
    isPolicyExpenseChatEnabled: true,
    customUnits: {
        C9031B6F4725D: {
            attributes: {
                taxEnabled: false,
                unit: 'mi',
            },
            customUnitID: 'C9031B6F4725D',
            defaultCategory: '',
            enabled: true,
            name: 'Distance',
            rates: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '222AAF6B93BCB': {
                    attributes: {},
                    currency: 'USD',
                    customUnitRateID: '222AAF6B93BCB',
                    enabled: true,
                    name: 'Default Rate',
                    rate: 67,
                    subRates: [],
                },
                EE75E6DBC6FF8: {
                    attributes: {},
                    currency: 'USD',
                    customUnitRateID: 'EE75E6DBC6FF8',
                    enabled: true,
                    name: 'Default Rate 1',
                    rate: 100,
                    subRates: [],
                },
                B593F3FBBB0BD: {
                    currency: 'USD',
                    name: 'New Rate',
                    rate: 900,
                    customUnitRateID: 'B593F3FBBB0BD',
                    enabled: true,
                    attributes: {},
                    subRates: [],
                    pendingFields: {},
                },
            },
        },
    },
};

describe('DistanceRequestUtils', () => {
    describe('getDistanceRequestAmount', () => {
        test.each([
            [350, 8605.146, 'mi', 65.5],
            [561, 8605.146, 'km', 65.1],
        ] as const)('Correctly calculates amount %s for %s%s at a rate of %s per unit', (expectedResult: number, distance: number, unit: Unit, rate: number) => {
            expect(DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate)).toBe(expectedResult);
        });
    });
    describe('getCustomUnitRateID', () => {
        it('returns Fake P2P custom unit rateID if reportID is undefined', () => {
            const reportID = undefined;
            const isPolicyExpenseChat = false;

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: undefined,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe(CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        });

        it('returns Fake P2P custom unit rateID if isPolicyExpenseChat is false', () => {
            const reportID = '1234';
            const isPolicyExpenseChat = false;

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: undefined,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe(CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        });

        it('returns Fake P2P custom unit rateID if policy is undefined', () => {
            const reportID = '1234';
            const isPolicyExpenseChat = true;

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: undefined,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe(CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        });

        it('returns policy default rateID custom unit rateID if lastSelectedDistanceRates is undefined', () => {
            const reportID = '1234';
            const isPolicyExpenseChat = true;

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: FAKE_POLICY,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe('222AAF6B93BCB');
        });

        it('returns policy last selected rateID custom unit rateID if lastSelectedDistanceRates is defined', () => {
            const reportID = '1234';
            const isPolicyExpenseChat = true;

            const lastSelectedDistanceRates = {
                [FAKE_POLICY.id]: 'B593F3FBBB0BD',
            };

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: FAKE_POLICY,
                lastSelectedDistanceRates,
            });

            expect(result).toBe('B593F3FBBB0BD');
        });
    });

    describe('getDistanceForDisplay', () => {
        it('returns empty string when distance is 0 and isManualDistanceRequest is false', () => {
            const result = DistanceRequestUtils.getDistanceForDisplay(true, 0, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, 67, translateLocal, false, false);
            expect(result).toBe('');
        });

        it('formats zero distance when isManualDistanceRequest is true', () => {
            const result = DistanceRequestUtils.getDistanceForDisplay(true, 0, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, 67, translateLocal, false, true);
            expect(result).toBe(`0.00 ${translateLocal('common.miles')}`);
        });
    });

    describe('getDistanceMerchant', () => {
        const toLocaleDigitMock = (dot: string): string => dot;
        const getCurrencySymbolMock = (currency: string): string | undefined => {
            if (currency === 'USD') {
                return '$';
            }
            return undefined;
        };

        it('formats zero distance when isManualDistanceRequest is true', () => {
            const result = DistanceRequestUtils.getDistanceMerchant(
                true,
                0,
                CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                67,
                'USD',
                translateLocal,
                toLocaleDigitMock,
                getCurrencySymbolMock,
                true,
            );
            expect(result).toBe('0.00 mi @ $0.67 / mi');
        });
    });
});
