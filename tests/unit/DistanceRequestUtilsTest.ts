import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

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

    describe('getDistanceUnit', () => {
        it('returns the transaction unit when it matches the mileage rate unit', () => {
            const transaction = {
                comment: {
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                    },
                },
            } as Transaction;
            const mileageRate = {
                unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            } as MileageRate;

            expect(DistanceRequestUtils.getDistanceUnit(transaction, mileageRate)).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
        });

        it('returns the mileage rate unit when it differs from the transaction unit', () => {
            const transaction = {
                comment: {
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
                    },
                },
            } as Transaction;
            const mileageRate = {
                unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            } as MileageRate;

            expect(DistanceRequestUtils.getDistanceUnit(transaction, mileageRate)).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
        });
    });
});
