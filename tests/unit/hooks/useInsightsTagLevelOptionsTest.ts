import {act, renderHook, waitFor} from '@testing-library/react-native';

import useInsightsTagLevelOptions from '@pages/Insights/useInsightsTagLevelOptions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

type HookProps = {
    respondedTagLevels?: InsightsTagLevel[];
    policyIDs?: string[];
    selectedTagLevel: number;
    canChangeFilters?: boolean;
};

const TWO_LEVELS = [
    {level: 1, names: ['Department']},
    {level: 2, names: ['Location']},
];

/** Stores a Spend response for workspace A, as GetInsights leaves it in Onyx. */
async function storeSpendResponse(tagLevels: InsightsTagLevel[]) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.INSIGHTS}${CONST.INSIGHTS.DASHBOARD.SPEND}_1`, {
            inputQuery: 'groupBy:month tagLevel:1 groupCurrency:USD policyID:A date:this-month',
            tagLevels,
            requestedAt: 1,
        });
        await waitForBatchedUpdates();
    });
}

function renderOptionsHook(initialProps: HookProps) {
    const setFilters = jest.fn();
    const hook = renderHook(
        ({respondedTagLevels, policyIDs = [], selectedTagLevel, canChangeFilters = true}: HookProps) =>
            useInsightsTagLevelOptions({respondedTagLevels, policyIDs, selectedTagLevel, canChangeFilters, setFilters}),
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

    it('resets a saved level once a response for it lists only lower levels', () => {
        // Given a saved level two and no response yet
        const {rerender, setFilters} = renderOptionsHook({selectedTagLevel: 2});
        expect(setFilters).not.toHaveBeenCalled();

        // When the response lists only level one
        rerender({respondedTagLevels: [{level: 1, names: ['Department']}], selectedTagLevel: 2});

        // Then the dashboard falls back to level one
        expect(setFilters).toHaveBeenCalledWith({tagLevel: 1});
    });

    it('keeps a saved level that a stored response predating it leaves out, and still offers it', async () => {
        // Given a stored response from before workspace A added level two
        await storeSpendResponse([{level: 1, names: ['Department']}]);

        // When level two is selected and no response for it has arrived yet
        const {result, setFilters} = renderOptionsHook({policyIDs: ['A'], selectedTagLevel: 2});

        // Then the selection is kept, and the menu offers it so the user can switch back to level one
        await waitFor(() => expect(result.current.map((option) => option.value)).toEqual([1, 2]));
        expect(setFilters).not.toHaveBeenCalled();
    });

    it('keeps a saved level that a workspace in scope still has', async () => {
        // Given a saved level two and a stored response with both levels
        await storeSpendResponse(TWO_LEVELS);

        // When the response for level two lists both levels
        const {result, setFilters} = renderOptionsHook({respondedTagLevels: TWO_LEVELS, policyIDs: ['A'], selectedTagLevel: 2});

        // Then both levels are offered and nothing is reset
        await waitFor(() =>
            expect(result.current).toEqual([
                {value: 1, label: 'Department'},
                {value: 2, label: 'Location'},
            ]),
        );
        expect(setFilters).not.toHaveBeenCalled();
    });

    it('shows the levels stored for the same workspaces until the current response arrives', async () => {
        // Given a stored Spend response that listed two levels for workspace A
        await storeSpendResponse(TWO_LEVELS);

        // When the dashboard for workspace A waits on a response for new filters
        const {result, rerender} = renderOptionsHook({policyIDs: ['A'], selectedTagLevel: 1});

        // Then the menu offers the stored levels
        await waitFor(() => expect(result.current).toHaveLength(2));

        // When the workspace scope changes to one with nothing stored
        rerender({policyIDs: ['B'], selectedTagLevel: 1});

        // Then the levels of the other workspaces are not offered
        await waitFor(() => expect(result.current).toHaveLength(1));
    });

    it('waits until filters can change before resetting', () => {
        // Given a response without the saved level while filters can't change
        const oneLevel = [{level: 1, names: []}];
        const {rerender, setFilters} = renderOptionsHook({respondedTagLevels: oneLevel, selectedTagLevel: 2, canChangeFilters: false});
        expect(setFilters).not.toHaveBeenCalled();

        // When filters can change again
        rerender({respondedTagLevels: oneLevel, selectedTagLevel: 2, canChangeFilters: true});

        // Then the reset goes through
        expect(setFilters).toHaveBeenCalledWith({tagLevel: 1});
    });
});
