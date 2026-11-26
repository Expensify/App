import {renderHook} from '@testing-library/react-native';

import useInsightsTagLevelOptions from '@pages/Insights/useInsightsTagLevelOptions';

import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

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

    it('keeps the last levels for the same workspaces while the next response loads', () => {
        // Given levels loaded for the current workspaces
        const {result, rerender} = renderOptionsHook({tagLevels: TWO_LEVELS, policyIDs: ['A'], selectedTagLevel: 1});

        // When a filter change reads a response that hasn't arrived yet
        rerender({tagLevels: undefined, policyIDs: ['A'], selectedTagLevel: 2});

        // Then the menu still offers both levels
        expect(result.current).toHaveLength(2);

        // When the workspace scope changes before its response arrives
        rerender({tagLevels: undefined, policyIDs: ['B'], selectedTagLevel: 2});

        // Then the levels of the other workspaces are not offered
        expect(result.current).toHaveLength(1);
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
