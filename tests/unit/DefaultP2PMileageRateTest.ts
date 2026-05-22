import type * as TransactionModuleType from '@libs/actions/Transaction';
import type * as APIModuleType from '@libs/API';
import type DistanceRequestUtilsType from '@libs/DistanceRequestUtils';
import CONST from '@src/CONST';

type DistanceRequestUtilsModule = typeof DistanceRequestUtilsType;
type TransactionModule = typeof TransactionModuleType;
type APIModule = typeof APIModuleType;

/**
 * Load fresh copies of the modules so the in-memory `storedDefaultP2PMileageRate`
 * starts undefined for every test.
 */
function loadFreshModules() {
    let api!: APIModule;
    let transaction!: TransactionModule;
    let distanceRequestUtils!: DistanceRequestUtilsModule;
    jest.isolateModules(() => {
        api = require('@libs/API') as APIModule;
        transaction = require('@libs/actions/Transaction') as TransactionModule;
        distanceRequestUtils = (require('@libs/DistanceRequestUtils') as {default: DistanceRequestUtilsModule}).default;
    });
    return {api, transaction, distanceRequestUtils};
}

describe('Default P2P mileage rate', () => {
    describe('getDefaultP2PMileageRate', () => {
        it('parses the {rate, unit} response and exposes it via getStoredDefaultP2PMileageRate', async () => {
            const {api, transaction} = loadFreshModules();
            const response = {onyxData: [{key: 'defaultP2PMileageRate', value: {rate: 7000, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}}]};
            jest.spyOn(api, 'makeRequestWithSideEffects').mockResolvedValueOnce(response as never);

            transaction.getDefaultP2PMileageRate();
            await Promise.resolve();

            expect(transaction.getStoredDefaultP2PMileageRate()).toEqual({rate: 7000, unit: 'km'});
        });

        it('leaves the stored rate undefined when the response has no defaultP2PMileageRate entry', async () => {
            const {api, transaction} = loadFreshModules();
            jest.spyOn(api, 'makeRequestWithSideEffects').mockResolvedValueOnce({onyxData: []} as never);

            transaction.getDefaultP2PMileageRate();
            await Promise.resolve();

            expect(transaction.getStoredDefaultP2PMileageRate()).toBeUndefined();
        });

        it('leaves the stored rate undefined when the value is missing required keys', async () => {
            const {api, transaction} = loadFreshModules();
            const response = {onyxData: [{key: 'defaultP2PMileageRate', value: {rate: 5000}}]};
            jest.spyOn(api, 'makeRequestWithSideEffects').mockResolvedValueOnce(response as never);

            transaction.getDefaultP2PMileageRate();
            await Promise.resolve();

            expect(transaction.getStoredDefaultP2PMileageRate()).toBeUndefined();
        });
    });

    describe('getRateForP2P', () => {
        it('falls back to USD 67¢/mile when no rate has been fetched yet', () => {
            const {distanceRequestUtils} = loadFreshModules();

            const result = distanceRequestUtils.getRateForP2P('EUR', undefined);

            expect(result).toEqual({rate: 6700, unit: 'mi', currency: CONST.CURRENCY.USD});
        });

        it("uses the stored rate with the caller's currency once a rate is available", async () => {
            const {api, transaction, distanceRequestUtils} = loadFreshModules();
            const response = {onyxData: [{key: 'defaultP2PMileageRate', value: {rate: 5500, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}}]};
            jest.spyOn(api, 'makeRequestWithSideEffects').mockResolvedValueOnce(response as never);
            transaction.getDefaultP2PMileageRate();
            await Promise.resolve();

            const result = distanceRequestUtils.getRateForP2P('EUR', undefined);

            expect(result).toEqual({rate: 5500, unit: 'km', currency: 'EUR'});
        });
    });
});
