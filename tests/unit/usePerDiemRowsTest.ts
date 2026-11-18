import {renderHook} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import usePerDiemRows from '@pages/workspace/perDiem/usePerDiemRows';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

// The same function on every render, as the real one is, because rows are only kept while their inputs stay the same.
const mockTranslate = jest.fn();
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

jest.mock('@libs/actions/Policy/InlineEdit', () => ({
    renamePerDiemDestinationInline: jest.fn(),
    renamePerDiemSubrateInline: jest.fn(),
    updatePerDiemAmountInline: jest.fn(),
}));

jest.mock('@userActions/Policy/PerDiem', () => ({
    clearPerDiemRateError: jest.fn(),
}));

jest.mock('@libs/showInlineEditError', () => jest.fn());

const POLICY_ID = 'policy1';

function createRates(): Record<string, Rate> {
    return {
        rate1: {
            customUnitRateID: 'rate1',
            name: 'Paris',
            currency: 'EUR',
            subRates: [
                {id: 'sub1', name: 'Breakfast', rate: 600},
                {id: 'sub2', name: 'Lunch', rate: 1200},
            ],
        },
        rate2: {
            customUnitRateID: 'rate2',
            name: 'Rome',
            currency: 'EUR',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            subRates: [{id: 'sub3', name: 'Dinner', rate: 1500}],
        },
    };
}

function createCustomUnit(rates: Record<string, Rate>): CustomUnit {
    return {customUnitID: 'unit1', name: 'Per Diem', rates};
}

type HookProps = {
    customUnit: CustomUnit | undefined;
    isOffline?: boolean;
    canWritePerDiem?: boolean;
};

function renderPerDiemRows(initialProps: HookProps) {
    return renderHook(({customUnit, isOffline = false, canWritePerDiem = true}: HookProps) => usePerDiemRows({customUnit, isOffline, canWritePerDiem, policyID: POLICY_ID}), {initialProps});
}

describe('usePerDiemRows', () => {
    it('builds a row for every subrate that is not being deleted', () => {
        // Given a policy with a rate that is being deleted next to one that is not
        const customUnit = createCustomUnit(createRates());

        // When the rows are built while online
        const {result} = renderPerDiemRows({customUnit});

        // Then the subrates of the deleted rate are left out of the table
        expect(result.current.perDiemRows.map((row) => row.subRateName)).toEqual(['Breakfast', 'Lunch']);
    });

    it('keeps the rows of a rate that is being deleted while offline, disabled', () => {
        // Given a rate that is being deleted, which the server hasn't confirmed because the user is offline
        const customUnit = createCustomUnit(createRates());

        // When the rows are built while offline
        const {result} = renderPerDiemRows({customUnit, isOffline: true});

        // Then its row stays visible so the user can see it, and can't be edited
        const deletedRow = result.current.perDiemRows.find((row) => row.subRateName === 'Dinner');
        expect(deletedRow?.disabled).toBe(true);
        expect(deletedRow?.canEditAmount).toBe(false);
    });

    it('only lets members who can write edit a row', () => {
        // Given a member who can only read the Per Diem rates
        const customUnit = createCustomUnit(createRates());

        // When the rows are built for them
        const {result} = renderPerDiemRows({customUnit, canWritePerDiem: false});

        // Then no cell of the row is editable
        const [row] = result.current.perDiemRows;
        expect([row?.canEditDestination, row?.canEditSubrate, row?.canEditAmount]).toEqual([false, false, false]);
    });

    it('leaves rows that are being deleted out of the selectable subrates', () => {
        // Given a policy with a rate that is being deleted
        const customUnit = createCustomUnit(createRates());

        // When the selectable subrates are read
        const {result} = renderPerDiemRows({customUnit});

        // Then selecting everything can't include rows that are on their way out
        expect(Object.keys(result.current.selectableSubRatesByKey)).toEqual(['rate1:sub1', 'rate1:sub2']);
    });

    it('opens the details of the subrate the row stands for', () => {
        // Given the rows of a policy
        const customUnit = createCustomUnit(createRates());
        const {result} = renderPerDiemRows({customUnit});
        const lunchRow = result.current.perDiemRows.find((row) => row.subRateName === 'Lunch');

        // When that row is pressed
        lunchRow?.action();

        // Then the user lands on the details of that subrate, not of another one
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(POLICY_ID, 'rate1', 'sub2'));
    });

    it('returns the same rows when the page renders again with the same inputs', () => {
        // Given rows that were already built. The page renders on every selection change, and rebuilding every row each time
        // made selecting slow for a workspace with a very large number of subrates.
        const customUnit = createCustomUnit(createRates());
        const {result, rerender} = renderPerDiemRows({customUnit});
        const firstRows = result.current.perDiemRows;
        const firstSubRates = result.current.allSubRates;

        // When the page renders again and nothing the rows depend on has changed
        rerender({customUnit});

        // Then the earlier arrays are reused
        expect(result.current.perDiemRows).toBe(firstRows);
        expect(result.current.allSubRates).toBe(firstSubRates);
    });

    it('rebuilds the rows when the rates change', () => {
        // Given rows built for one set of rates
        const customUnit = createCustomUnit(createRates());
        const {result, rerender} = renderPerDiemRows({customUnit});
        const firstRows = result.current.perDiemRows;

        // When a rate is edited, which gives the policy a new rates object
        rerender({customUnit: createCustomUnit({...createRates(), rate3: {customUnitRateID: 'rate3', name: 'Oslo', currency: 'EUR', subRates: [{id: 'sub4', name: 'Dinner', rate: 900}]}})});

        // Then the new subrate is part of the rows instead of the earlier rows being returned
        expect(result.current.perDiemRows).not.toBe(firstRows);
        expect(result.current.perDiemRows.map((row) => row.destination)).toEqual(['Paris', 'Paris', 'Oslo']);
    });

    it('rebuilds the rows when the network state changes', () => {
        // Given rows built while online
        const customUnit = createCustomUnit(createRates());
        const {result, rerender} = renderPerDiemRows({customUnit, isOffline: false});
        const onlineRows = result.current.perDiemRows;

        // When the user goes offline, which brings the rows of the rate being deleted back
        rerender({customUnit, isOffline: true});

        // Then the rows are rebuilt for the new state
        expect(result.current.perDiemRows).not.toBe(onlineRows);
        expect(result.current.perDiemRows).toHaveLength(3);
    });

    it('rebuilds the rows when the user can no longer write', () => {
        // Given rows built for a member who can write
        const customUnit = createCustomUnit(createRates());
        const {result, rerender} = renderPerDiemRows({customUnit, canWritePerDiem: true});
        const writableRows = result.current.perDiemRows;

        // When their permission is taken away
        rerender({customUnit, canWritePerDiem: false});

        // Then the cached rows that were editable aren't returned
        expect(result.current.perDiemRows).not.toBe(writableRows);
        expect(result.current.perDiemRows.every((row) => !row.canEditAmount)).toBe(true);
    });

    it('releases the rows when the page unmounts', () => {
        // Given a page that built its rows, which can be well over a hundred thousand. The rates object they come from stays in
        // Onyx after the page is gone, so anything keyed by it would keep the rows in memory after the user left.
        const customUnit = createCustomUnit(createRates());
        const first = renderPerDiemRows({customUnit});
        const rowsOfFirstVisit = first.result.current.perDiemRows;

        // When the page is left and later opened again with the very same rates object
        first.unmount();
        const second = renderPerDiemRows({customUnit});

        // Then the rows are built again, which only happens if the earlier ones were released
        expect(second.result.current.perDiemRows).not.toBe(rowsOfFirstVisit);
        expect(second.result.current.perDiemRows.map((row) => row.subRateName)).toEqual(rowsOfFirstVisit.map((row) => row.subRateName));
    });
});
