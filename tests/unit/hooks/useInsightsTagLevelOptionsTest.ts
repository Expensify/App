import {act, renderHook, waitFor} from '@testing-library/react-native';

import useInsightsTagLevelOptions from '@pages/Insights/useInsightsTagLevelOptions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

type HookProps = {
    tagLevels: InsightsTagLevel[] | undefined;
    policyIDs?: string[];
    selectedTagLevel: number;
    canChangeFilters?: boolean;
};

const TWO_LEVELS = [
    {level: 1, names: ['Department']},
    {level: 2, names: ['Location']},
];

function renderOptionsHook(initialProps: HookProps) {
    const setFilters = jest.fn();
    const hook = renderHook(
        ({tagLevels, policyIDs = [], selectedTagLevel, canChangeFilters = true}: HookProps) =>
            useInsightsTagLevelOptions({tagLevels, policyIDs, selectedTagLevel, canChangeFilters, setFilters}),
        {initialProps},
    );
    return {...hook, setFilters};
}

describe('useInsightsTagLevelOptions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('waits for GetInsights to list the levels before resetting a saved level', () => {
        // Given a saved level two and no response yet
        const {rerender, setFilters} = renderOptionsHook({tagLevels: undefined, selectedTagLevel: 2});

        // Then the saved level is kept while the levels are unknown
        expect(setFilters).not.toHaveBeenCalled();

        // When the response lists only level one
        rerender({tagLevels: [{level: 1, names: ['Department']}], selectedTagLevel: 2});

        // Then the dashboard falls back to level one
        expect(setFilters).toHaveBeenCalledWith({tagLevel: 1});
    });

    it('keeps a saved level that a workspace in scope still has', () => {
        // Given a saved level two and a response that lists it
        const {result, setFilters} = renderOptionsHook({tagLevels: TWO_LEVELS, selectedTagLevel: 2});

        // Then both levels are offered and nothing is reset
        expect(result.current).toEqual([
            {value: 1, label: 'Department'},
            {value: 2, label: 'Location'},
        ]);
        expect(setFilters).not.toHaveBeenCalled();
    });

    it('shows the levels stored for the same workspaces until the current response arrives', async () => {
        // Given a stored Spend response that listed two levels for workspace A
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS}${CONST.INSIGHTS.DASHBOARD.SPEND}_1`, {
                inputQuery: 'groupBy:month tagLevel:1 groupCurrency:USD policyID:A date:this-month',
                tagLevels: TWO_LEVELS,
            });
            await waitForBatchedUpdates();
        });

        // When the dashboard for workspace A waits on a response for new filters
        const {result, rerender} = renderOptionsHook({tagLevels: undefined, policyIDs: ['A'], selectedTagLevel: 2});

        // Then the menu offers the stored levels
        await waitFor(() => expect(result.current).toHaveLength(2));

        // When the workspace scope changes to one with nothing stored
        rerender({tagLevels: undefined, policyIDs: ['B'], selectedTagLevel: 2});

        // Then the levels of the other workspaces are not offered
        await waitFor(() => expect(result.current).toHaveLength(1));
    });

    it('waits until filters can change before resetting', () => {
        // Given a response without the saved level while filters can't change
        const {rerender, setFilters} = renderOptionsHook({tagLevels: [{level: 1, names: []}], selectedTagLevel: 2, canChangeFilters: false});
        expect(setFilters).not.toHaveBeenCalled();

        // When filters can change again
        rerender({tagLevels: [{level: 1, names: []}], selectedTagLevel: 2, canChangeFilters: true});

        // Then the reset goes through
        expect(setFilters).toHaveBeenCalledWith({tagLevel: 1});
    });
});
