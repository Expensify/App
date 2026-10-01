import {editPerDiemRateAmount, editPerDiemRateCurrency, editPerDiemRateDestination, editPerDiemRateSubrate} from '@libs/actions/Policy/PerDiem';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

const customUnitID = 'custom-unit';
const rateID = 'destination-one';
const unchangedRateID = 'destination-two';
const currentRate: Rate = {
    customUnitRateID: rateID,
    name: 'Destination One',
    currency: 'USD',
    enabled: true,
    rate: 0,
    subRates: [
        {id: 'breakfast', name: 'Breakfast', rate: 1700},
        {id: 'lunch', name: 'Lunch', rate: 1904},
    ],
};
const customUnit: CustomUnit = {
    customUnitID,
    name: 'Per Diem International',
    enabled: true,
    rates: {
        [rateID]: currentRate,
        [unchangedRateID]: {
            customUnitRateID: unchangedRateID,
            name: 'Destination Two',
            currency: 'USD',
            enabled: true,
            rate: 0,
            subRates: [{id: 'breakfast-two', name: 'Breakfast', rate: 2000}],
        },
    },
};

describe('actions/Policy/PerDiem', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('sends only the changed rate when editing a destination', () => {
        // Given a Per Diem custom unit with multiple destinations.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one destination is renamed.
        editPerDiemRateDestination('policy', rateID, customUnit, 'Updated Destination');

        // Then only that destination is sent and optimistically updated.
        expect(writeSpy).toHaveBeenCalledTimes(1);
        const call = writeSpy.mock.calls.at(0);
        const parameters = call?.at(1);
        const onyxData = call?.at(2);
        expect(call?.at(0)).toBe(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT);
        expect(parameters).toEqual({
            policyID: 'policy',
            customUnitID,
            customUnitRate: expect.any(String),
        });
        expect(parameters).not.toHaveProperty('customUnit');
        if (!parameters || !('customUnitRate' in parameters)) {
            throw new Error('Expected targeted custom unit parameters');
        }
        expect(JSON.parse(parameters.customUnitRate)).toEqual({...currentRate, name: 'Updated Destination'});
        expect(parameters.customUnitRate).not.toContain(unchangedRateID);
        expect(onyxData?.optimisticData?.at(0)?.value).toMatchObject({
            customUnits: {
                [customUnitID]: {
                    rates: {
                        [rateID]: {
                            name: 'Updated Destination',
                        },
                    },
                },
            },
        });
    });

    it('sends only the changed rate when editing a subrate name', () => {
        // Given a Per Diem custom unit with multiple destinations and subrates.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one subrate is renamed.
        editPerDiemRateSubrate('policy', rateID, 'breakfast', customUnit, 'Morning meal');

        // Then only its parent destination is sent.
        const call = writeSpy.mock.calls.at(0);
        const parameters = call?.at(1);
        expect(call?.at(0)).toBe(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT);
        expect(parameters).not.toHaveProperty('customUnit');
        if (!parameters || !('customUnitRate' in parameters)) {
            throw new Error('Expected targeted custom unit parameters');
        }
        expect(JSON.parse(parameters.customUnitRate)).toEqual({
            ...currentRate,
            subRates: [
                {id: 'breakfast', name: 'Morning meal', rate: 1700},
                {id: 'lunch', name: 'Lunch', rate: 1904},
            ],
        });
    });

    it('sends only the changed rate when editing an amount', () => {
        // Given a Per Diem custom unit with multiple destinations and subrates.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one subrate amount is changed.
        editPerDiemRateAmount('policy', rateID, 'breakfast', customUnit, 1701);

        // Then only its parent destination is sent.
        const call = writeSpy.mock.calls.at(0);
        const parameters = call?.at(1);
        expect(call?.at(0)).toBe(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT);
        expect(parameters).not.toHaveProperty('customUnit');
        if (!parameters || !('customUnitRate' in parameters)) {
            throw new Error('Expected targeted custom unit parameters');
        }
        expect(JSON.parse(parameters.customUnitRate)).toEqual({
            ...currentRate,
            subRates: [
                {id: 'breakfast', name: 'Breakfast', rate: 1701},
                {id: 'lunch', name: 'Lunch', rate: 1904},
            ],
        });
    });

    it('sends only the changed rate when editing a currency', () => {
        // Given a Per Diem custom unit with multiple destinations.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one destination's currency is changed.
        editPerDiemRateCurrency('policy', rateID, customUnit, 'EUR');

        // Then only that destination is sent.
        const call = writeSpy.mock.calls.at(0);
        const parameters = call?.at(1);
        expect(call?.at(0)).toBe(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT);
        expect(parameters).not.toHaveProperty('customUnit');
        if (!parameters || !('customUnitRate' in parameters)) {
            throw new Error('Expected targeted custom unit parameters');
        }
        expect(JSON.parse(parameters.customUnitRate)).toEqual({...currentRate, currency: 'EUR'});
    });
});
