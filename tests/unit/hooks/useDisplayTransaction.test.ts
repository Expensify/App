import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDisplayTransaction from '@hooks/useDisplayTransaction';
import useLocalize from '@hooks/useLocalize';

import {translate as translateWithLocale} from '@libs/Localize';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize');
jest.mock('@hooks/useCurrencyList');

describe('useDisplayTransaction', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        await Onyx.clear();
        jest.mocked(useLocalize).mockReturnValue(
            createMock<LocaleContextProps>({
                translate: (path, ...parameters) => translateWithLocale(CONST.LOCALES.EN, path, ...parameters),
            }),
        );
        jest.mocked(useCurrencyListActions).mockReturnValue(
            createMock<ReturnType<typeof useCurrencyListActions>>({
                getCurrencySymbol: () => '$',
            }),
        );
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('uses the original policy when the supplied policy does not contain the distance rate', async () => {
        // Given a reduced expense without modified snapshots, so restoration requires a policy rate
        const suppliedPolicy: Policy = {
            ...createRandomPolicy(1),
            id: 'display-policy-without-rate',
            customUnits: {},
        };
        const originalPolicy: Policy = {
            ...createRandomPolicy(2),
            id: 'display-original-policy',
            customUnits: {
                distance: {
                    customUnitID: 'distance',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    enabled: true,
                    attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                    rates: {
                        selectedRate: {customUnitRateID: 'selectedRate', rate: 76, currency: CONST.CURRENCY.USD, enabled: true},
                    },
                },
            },
        };
        const transaction: Transaction = {
            transactionID: 'display-distance-transaction',
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            amount: 415,
            currency: CONST.CURRENCY.USD,
            created: '2026-10-20',
            merchant: '5.46 mi @ $0.76 / mi',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            comment: {
                customUnit: {
                    customUnitRateID: 'selectedRate',
                    quantity: 6.46,
                    reimbursableDistance: 5.46,
                    commuterExclusion: 1,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            },
        };
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${suppliedPolicy.id}`, suppliedPolicy);
        await waitForBatchedUpdates();
        const {result} = renderHook(() => useDisplayTransaction(transaction, false, suppliedPolicy));
        await waitForBatchedUpdates();
        expect(result.current.distanceOriginalPolicy).toBeUndefined();
        expect(result.current.displayTransaction?.amount).toBe(415);

        // When the actual cross-policy selector discovers the policy owning the selected rate
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${originalPolicy.id}`, originalPolicy);
        });

        // Then the hook uses that policy, rather than the rate-less fallback, to restore the full route
        await waitFor(() => {
            expect(result.current.distanceOriginalPolicy?.id).toBe(originalPolicy.id);
            expect(result.current.displayTransaction?.amount).toBe(491);
            expect(result.current.displayTransaction?.merchant).toBe('6.46 mi @ $0.76 / mi');
        });
    });
});
