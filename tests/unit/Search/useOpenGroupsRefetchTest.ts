import {renderHook} from '@testing-library/react-native';

import useOpenGroupsRefetch from '@components/Search/hooks/useOpenGroupsRefetch';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';

import {search} from '@libs/actions/Search';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import type * as Navigation from '@react-navigation/native';

const mockIsScreenFocused = {current: true};
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof Navigation>('@react-navigation/native'),
    useIsFocused: () => mockIsScreenFocused.current,
}));

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
}));

const mockSearch = jest.mocked(search);

const FOOD_QUERY = buildSearchQueryJSON('type:expense category:Food');
const TRAVEL_QUERY = buildSearchQueryJSON('type:expense category:Travel');

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial group rows
const DATA = [
    {keyForList: 'Food', category: 'Food', transactions: [], transactionsQueryJSON: FOOD_QUERY},
    {keyForList: 'Travel', category: 'Travel', transactions: [], transactionsQueryJSON: TRAVEL_QUERY},
    {keyForList: 'Report', category: 'Food', transactions: []},
] as unknown as SearchListItem[];

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the fields the group matching reads
const buildTransaction = (transactionID: string, category: string) => ({transactionID, category}) as Transaction;

type HookProps = {
    expandedGroups?: Set<string>;
    newTransactions?: Transaction[];
};

function renderRefetch(initialProps: HookProps) {
    return renderHook(
        ({expandedGroups = new Set(), newTransactions = []}: HookProps) => useOpenGroupsRefetch({data: DATA, expandedGroups, newTransactions, groupBy: CONST.SEARCH.GROUP_BY.CATEGORY}),
        {initialProps},
    );
}

beforeEach(() => {
    mockSearch.mockClear();
    mockIsScreenFocused.current = true;
});

describe('useOpenGroupsRefetch', () => {
    it('does not fetch when a group opens, because opening it fetches it already', () => {
        // Given no open groups
        const {rerender} = renderRefetch({});

        // When a group opens
        rerender({expandedGroups: new Set(['Food'])});

        // Then it isn't fetched a second time
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('fetches an open group again when an expense is created in it, whether or not its row is on screen', () => {
        // Given two open groups, which may be scrolled out of view, since the list fetches them rather than their rows
        const expandedGroups = new Set(['Food', 'Travel']);
        const {rerender} = renderRefetch({expandedGroups});

        // When an expense is created in one of them
        rerender({expandedGroups, newTransactions: [buildTransaction('1', 'Food')]});

        // Then only that group's first page is fetched again, so the new expense shows up when it is scrolled back into view
        expect(mockSearch).toHaveBeenCalledTimes(1);
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: FOOD_QUERY, offset: 0}));
    });

    it('fetches once per created expense even when Search hands over the same expenses again', () => {
        // Given an open group that just had an expense created in it
        const expandedGroups = new Set(['Food']);
        const {rerender} = renderRefetch({expandedGroups, newTransactions: [buildTransaction('1', 'Food')]});
        mockSearch.mockClear();

        // When Search renders again with a new array holding the same expense
        rerender({expandedGroups, newTransactions: [buildTransaction('1', 'Food')]});

        // Then the group isn't fetched again
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('does not fetch when an expense is created in a closed group', () => {
        // Given an open group and a closed one
        const expandedGroups = new Set(['Travel']);
        const {rerender} = renderRefetch({expandedGroups});

        // When an expense is created in the closed one
        rerender({expandedGroups, newTransactions: [buildTransaction('1', 'Food')]});

        // Then nothing is fetched, because opening the group fetches it
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('fetches every open group again when the user comes back to the screen', () => {
        // Given two open groups and a closed one
        const expandedGroups = new Set(['Food', 'Travel']);
        const {rerender} = renderRefetch({expandedGroups});

        // When the user leaves the screen, for example to edit an expense in the RHP, and comes back
        mockIsScreenFocused.current = false;
        rerender({expandedGroups});
        mockIsScreenFocused.current = true;
        rerender({expandedGroups});

        // Then each open group is fetched again, so its expenses match the totals that may have changed meanwhile
        expect(mockSearch).toHaveBeenCalledTimes(2);
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: FOOD_QUERY, offset: 0}));
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: TRAVEL_QUERY, offset: 0}));
    });

    it('does not fetch an open group that has no search of its own', () => {
        // Given an open group with nothing to fetch, such as an expense report
        const expandedGroups = new Set(['Report']);
        const {rerender} = renderRefetch({expandedGroups});

        // When an expense is created in it and the user comes back to the screen
        rerender({expandedGroups, newTransactions: [buildTransaction('1', 'Food')]});
        mockIsScreenFocused.current = false;
        rerender({expandedGroups});
        mockIsScreenFocused.current = true;
        rerender({expandedGroups});

        // Then no search runs
        expect(mockSearch).not.toHaveBeenCalled();
    });
});
