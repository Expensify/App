/* eslint-disable rulesdir/no-multiple-api-calls -- Each test invokes one action; the rule's ancestor scan combines otherwise independent tests. */
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
        const updatedRate = {...currentRate, name: 'Updated Destination'};
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {
                policyID: 'policy',
                customUnitID,
                customUnitRate: JSON.stringify(updatedRate),
            },
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        value: expect.objectContaining({
                            customUnits: {
                                [customUnitID]: {
                                    rates: {
                                        [rateID]: expect.objectContaining({name: 'Updated Destination'}),
                                    },
                                },
                            },
                        }),
                    }),
                ],
            }),
        );
        expect(JSON.stringify(updatedRate)).not.toContain(unchangedRateID);
    });

    it('sends only the changed rate when editing a subrate name', () => {
        // Given a Per Diem custom unit with multiple destinations and subrates.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one subrate is renamed.
        editPerDiemRateSubrate('policy', rateID, 'breakfast', customUnit, 'Morning meal');

        // Then only its parent destination is sent.
        const updatedRate = {
            ...currentRate,
            subRates: [
                {id: 'breakfast', name: 'Morning meal', rate: 1700},
                {id: 'lunch', name: 'Lunch', rate: 1904},
            ],
        };
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {policyID: 'policy', customUnitID, customUnitRate: JSON.stringify(updatedRate)},
            expect.any(Object),
        );
    });

    it('sends only the changed rate when editing an amount', () => {
        // Given a Per Diem custom unit with multiple destinations and subrates.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one subrate amount is changed.
        editPerDiemRateAmount('policy', rateID, 'breakfast', customUnit, 1701);

        // Then only its parent destination is sent.
        const updatedRate = {
            ...currentRate,
            subRates: [
                {id: 'breakfast', name: 'Breakfast', rate: 1701},
                {id: 'lunch', name: 'Lunch', rate: 1904},
            ],
        };
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {policyID: 'policy', customUnitID, customUnitRate: JSON.stringify(updatedRate)},
            expect.any(Object),
        );
    });

    it('sends only the changed rate when editing a currency', () => {
        // Given a Per Diem custom unit with multiple destinations.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one destination's currency is changed.
        editPerDiemRateCurrency('policy', rateID, customUnit, 'EUR');

        // Then only that destination is sent.
        const updatedRate = {...currentRate, currency: 'EUR'};
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {policyID: 'policy', customUnitID, customUnitRate: JSON.stringify(updatedRate)},
            expect.any(Object),
        );
    });
});
