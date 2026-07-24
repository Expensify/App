import {startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {getDefaultP2PMileageRate} from '@libs/actions/Transaction';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getStoredDefaultP2PMileageRate from '@libs/getStoredDefaultP2PMileageRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/telemetry/activeSpans');

describe('Default P2P mileage rate', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getDefaultP2PMileageRate', () => {
        it('calls API.read with GetDefaultP2PMileageRate', () => {
            const readSpy = jest.spyOn(API, 'read').mockImplementation(() => {});

            getDefaultP2PMileageRate();

            expect(readSpy).toHaveBeenCalledWith(READ_COMMANDS.GET_DEFAULT_P2P_MILEAGE_RATE, null);
        });
    });

    describe('startMoneyRequest', () => {
        // Splitting a distance expense goes through startMoneyRequest, so it must prefetch the default P2P mileage rate
        // (the same way startDistanceRequest does) or the Distance tab loads with a malformed rate.
        it('prefetches the default P2P mileage rate when starting a split distance request', () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const readSpy = jest.spyOn(API, 'read').mockImplementation(() => {});

            startMoneyRequest(CONST.IOU.TYPE.SPLIT, '1', [], CONST.IOU.REQUEST_TYPE.DISTANCE);

            expect(readSpy).toHaveBeenCalledWith(READ_COMMANDS.GET_DEFAULT_P2P_MILEAGE_RATE, null);
        });

        // Non-split flows never expose a Distance tab, so they must not issue the (uncached) prefetch read.
        it('does not prefetch the default P2P mileage rate for non-split requests', () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const readSpy = jest.spyOn(API, 'read').mockImplementation(() => {});

            startMoneyRequest(CONST.IOU.TYPE.SUBMIT, '1', [], CONST.IOU.REQUEST_TYPE.MANUAL);

            expect(readSpy).not.toHaveBeenCalledWith(READ_COMMANDS.GET_DEFAULT_P2P_MILEAGE_RATE, null);
        });
    });

    describe('getRateForP2P', () => {
        it('falls back to USD 67¢/mile when no rate has been stored in Onyx', () => {
            const result = DistanceRequestUtils.getRateForP2P('EUR', undefined);

            expect(result).toEqual({rate: 67, unit: 'mi', currency: CONST.CURRENCY.USD});
        });

        it('uses the stored Onyx rate with the caller currency once a rate is available', async () => {
            await Onyx.set(ONYXKEYS.DEFAULT_P2P_MILEAGE_RATE, {rate: 5500, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS});
            await waitForBatchedUpdates();

            expect(getStoredDefaultP2PMileageRate()).toEqual({rate: 5500, unit: 'km'});

            const result = DistanceRequestUtils.getRateForP2P('EUR', undefined);

            expect(result).toEqual({rate: 5500, unit: 'km', currency: 'EUR'});
        });

        it('uses the transaction defaultP2PRate when the transaction currency matches', async () => {
            await Onyx.set(ONYXKEYS.DEFAULT_P2P_MILEAGE_RATE, {rate: 5500, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES});
            await waitForBatchedUpdates();

            const transaction = {
                ...createRandomTransaction(1),
                currency: CONST.CURRENCY.USD,
                comment: {customUnit: {defaultP2PRate: 99}},
            };

            const result = DistanceRequestUtils.getRateForP2P(CONST.CURRENCY.USD, transaction);

            expect(result).toEqual({rate: 99, unit: 'mi', currency: CONST.CURRENCY.USD});
        });
    });
});
