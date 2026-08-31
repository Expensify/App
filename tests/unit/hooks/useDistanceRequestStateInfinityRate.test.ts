import {renderHook} from '@testing-library/react-native';

import useDistanceRequestState from '@components/MoneyRequestConfirmationList/hooks/useDistanceRequestState';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import type * as OnyxTypes from '@src/types/onyx';

import createMock from '../../utils/createMock';

/**
 * Repro for https://github.com/Expensify/App/issues/99315
 *
 * A distance expense created in the self DM is a Track Expense. Submitting it to a workspace before the map finishes
 * generating sets `isMovingTransactionFromTrackExpense = true` while the workspace mileage rate is still unresolved,
 * so `useDistanceRequestState` back-calculates the rate from the known amount and distance:
 *
 *     rate = Math.abs(iouAmount) / (customUnit?.quantity ?? 1)
 *
 * At this instant the route distance has already resolved (`routes.route0.distance` is a real, non-zero value in
 * meters), but `customUnit.quantity` is still 0. `?? 1` only substitutes for null/undefined — not 0 — so the divide
 * is `iouAmount / 0 = Infinity`, and `round(distance * Infinity) = Infinity` renders as the ♾️ amount.
 *
 * The reported symbol being ♾️ (not "NaN") is itself the proof that the route distance had resolved: had it not,
 * `distance` would be 0 and `0 * Infinity = NaN` would render "NaN". So the only correct divisor to recover the
 * amount during the race is the route distance CONVERTED into the selected unit (mi/km) — dividing by raw meters
 * under-reports the amount by the meters→unit factor.
 */

// Only stub the two policy-rate lookups so the workspace rate reads as unresolved (the race window).
// Everything else — convertDistanceUnit, getDistanceRequestAmount, getDistanceInMeters — uses the real math, so the
// unit factor in the assertions below is genuine, not a test artifact.
jest.mock('@libs/DistanceRequestUtils', () => {
    const actual = jest.requireActual<{default: typeof DistanceRequestUtils}>('@libs/DistanceRequestUtils').default;
    return {
        __esModule: true,
        default: {
            ...actual,
            getDefaultMileageRate: () => undefined,
            // Workspace mileage rate not resolved yet: rate/currency are undefined, unit is known.
            getRate: () => ({rate: undefined, unit: 'mi', currency: undefined}),
        },
    };
});

type Params = Parameters<typeof useDistanceRequestState>[0];

// 1 mile in meters (matches METERS_TO_MILES so the converted distance is exactly 1 mi).
const ONE_MILE_IN_METERS = 1609.344;
// Seeded P2P amount that survives from the self-DM distance expense, in cents ($50.00).
const SEEDED_AMOUNT = 5000;

function buildRaceParams(): Params {
    return {
        // Track expense being moved to a workspace: route distance resolved (meters), quantity still 0 (map pending).
        transaction: createMock<OnyxTypes.Transaction>({
            transactionID: 'txn1',
            comment: {customUnit: {distanceUnit: 'mi', quantity: 0}},
            routes: {route0: {distance: ONE_MILE_IN_METERS, geometry: {coordinates: [], type: 'LineString'}}},
        }),
        policy: undefined,
        policyID: 'policy1',
        policyForMovingExpenses: undefined,
        isMovingTransactionFromTrackExpense: true,
        isDistanceRequest: true,
        iouAmount: SEEDED_AMOUNT,
        iouCurrencyCode: 'USD',
    };
}

describe('useDistanceRequestState – issue #99315 (♾️ amount on track-expense move before route resolves)', () => {
    it('does not render Infinity and keeps the correct amount while the workspace rate is pending', () => {
        const {result} = renderHook(() => useDistanceRequestState(buildRaceParams()));

        // Before the fix: rate = 5000 / 0 = Infinity -> distanceRequestAmount = Infinity -> ♾️.
        expect(Number.isFinite(result.current.distanceRequestAmount)).toBe(true);

        // With the divisor guarded and the route distance converted to the selected unit, the amount stays correct
        // (the seeded $50.00) instead of collapsing — matching the issue's Expected Result ("Amount will show the
        // correct expense amount"), rather than blanking to 0.
        expect(result.current.distanceRequestAmount).toBe(SEEDED_AMOUNT);
    });

    it('proves the divisor must be converted to the selected unit, not raw meters', () => {
        // The route distance in the selected unit (what the divisor should be).
        const distanceInUnit = DistanceRequestUtils.convertDistanceUnit(ONE_MILE_IN_METERS, 'mi'); // ≈ 1 mile

        // Correct back-calculation: divide by the distance in the selected unit.
        const correctRate = SEEDED_AMOUNT / distanceInUnit;
        const correctAmount = DistanceRequestUtils.getDistanceRequestAmount(ONE_MILE_IN_METERS, 'mi', correctRate);
        expect(correctAmount).toBe(SEEDED_AMOUNT);

        // Naive back-calculation: divide by the raw route distance in meters (skipping unit conversion).
        const naiveRate = SEEDED_AMOUNT / ONE_MILE_IN_METERS;
        const naiveAmount = DistanceRequestUtils.getDistanceRequestAmount(ONE_MILE_IN_METERS, 'mi', naiveRate);

        // The naive amount is under-reported by the meters→miles factor (~1609x): $50.00 becomes ~$0.03.
        expect(naiveAmount).not.toBe(SEEDED_AMOUNT);
        expect(naiveAmount).toBeLessThan(10);
        expect(SEEDED_AMOUNT / Math.max(naiveAmount, 1)).toBeGreaterThan(1000);
    });
});
