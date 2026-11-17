/** A workspace with an unmapped UK advisory fuel rate for VAT warning tests. */
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createMock from './createMock';

function createUKFuelRateTaxPolicy(): Policy {
    return createMock<Policy>({
        id: 'ukFuelTax',
        name: 'UK fuel tax',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        outputCurrency: CONST.CURRENCY.GBP,
        areDistanceRatesEnabled: true,
        tax: {trackingEnabled: true},
        customUnits: {
            distance: {
                customUnitID: 'distance',
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, taxEnabled: true},
                rates: {
                    fuel: {
                        customUnitRateID: 'fuel',
                        enabled: true,
                        attributes: {governmentRate: {sourceRateID: 'GB_PETROL_1400_2026-09-01'}},
                    },
                },
            },
        },
    });
}

export default createUKFuelRateTaxPolicy;
