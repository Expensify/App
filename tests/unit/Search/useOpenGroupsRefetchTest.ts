import {act, renderHook} from '@testing-library/react-native';

import useOpenGroupsRefetch from '@components/Search/hooks/useOpenGroupsRefetch';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';

import {hasInFlightSearch, search, waitForInFlightSearch} from '@libs/actions/Search';
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
    hasInFlightSearch: jest.fn(() => false),
    waitForInFlightSearch: jest.fn(() => Promise.resolve()),
}));

const mockSearch = jest.mocked(search);
const mockHasInFlightSearch = jest.mocked(hasInFlightSearch);
const mockWaitForInFlightSearch = jest.mocked(waitForInFlightSearch);

/** Holds the group's running search open until the test finishes it */
function holdInFlightSearch(hash: number | undefined) {
    let finishSearch = () => {};
    mockHasInFlightSearch.mockImplementation((searchHash) => searchHash === hash);
    mockWaitForInFlightSearch.mockImplementation(
        () =>
            new Promise<void>((resolve) => {
                finishSearch = () => {
                    mockHasInFlightSearch.mockReturnValue(false);
                    resolve();
                };
            }),
    );
    return async () => {
        await act(async () => {
            finishSearch();
            await Promise.resolve();
        });
    };
}

const FOOD_QUERY = buildSearchQueryJSON('type:expense category:Food');
const TRAVEL_QUERY = buildSearchQueryJSON('type:expense category:Travel');
const OFFICE_QUERY = buildSearchQueryJSON('type:expense category:Office');

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial group rows
const DATA = [
    {keyForList: 'Food', category: 'Food', transactions: [], transactionsQueryJSON: FOOD_QUERY},
    {keyForList: 'Travel', category: 'Travel', transactions: [], transactionsQueryJSON: TRAVEL_QUERY},
    {keyForList: 'Office', category: 'Office', transactions: [], transactionsQueryJSON: OFFICE_QUERY},
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
    mockHasInFlightSearch.mockReset();
    mockHasInFlightSearch.mockReturnValue(false);
    mockWaitForInFlightSearch.mockReset();
    mockWaitForInFlightSearch.mockResolvedValue(undefined);
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

    it('fetches an open group again when an expense is created in it', () => {
        // Given two open groups
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

        // Then each open group is fetched again, so its expenses match the totals that may have changed meanwhile, and the
        // closed one isn't, because opening it fetches it
        expect(mockSearch).toHaveBeenCalledTimes(2);
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: FOOD_QUERY, offset: 0}));
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: TRAVEL_QUERY, offset: 0}));
        expect(mockSearch).not.toHaveBeenCalledWith(expect.objectContaining({queryJSON: OFFICE_QUERY}));
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

    it('does not fetch an open group again while another page of it is loading', () => {
        // Given two open groups, one of which is still loading its "show more" page
        const expandedGroups = new Set(['Food', 'Travel']);
        const {rerender} = renderRefetch({expandedGroups});
        mockHasInFlightSearch.mockImplementation((hash) => hash === FOOD_QUERY?.hash);

        // When the user comes back to the screen
        mockIsScreenFocused.current = false;
        rerender({expandedGroups});
        mockIsScreenFocused.current = true;
        rerender({expandedGroups});

        // Then only the other group is fetched, because fetching the first page would reset the loading group's offset under it
        expect(mockSearch).toHaveBeenCalledTimes(1);
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: TRAVEL_QUERY, offset: 0}));
    });

    it('fetches an open group again after its running search finishes when an expense is created in it', async () => {
        // Given an open group whose search was sent before the new expense was written, as when the RHP closes first and
        // returning to the screen fetches the group again
        const expandedGroups = new Set(['Food']);
        const {rerender} = renderRefetch({expandedGroups});
        const finishSearch = holdInFlightSearch(FOOD_QUERY?.hash);

        // When the expense is created in it while that search is running
        rerender({expandedGroups, newTransactions: [buildTransaction('1', 'Food')]});

        // Then the group waits instead of fetching over the running search
        expect(mockSearch).not.toHaveBeenCalled();

        // And it fetches its first page again once that search finishes, so the new expense shows up
        await finishSearch();
        expect(mockSearch).toHaveBeenCalledTimes(1);
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: FOOD_QUERY, offset: 0}));
    });

    it('fetches a waiting group only once when several expenses are created in it during its running search', async () => {
        // Given an open group with a running search
        const expandedGroups = new Set(['Food']);
        const {rerender} = renderRefetch({expandedGroups});
        const finishSearch = holdInFlightSearch(FOOD_QUERY?.hash);

        // When two expenses are created in it, one after the other, before that search finishes
        rerender({expandedGroups, newTransactions: [buildTransaction('1', 'Food')]});
        rerender({expandedGroups, newTransactions: [buildTransaction('2', 'Food')]});
        await finishSearch();

        // Then a single fetch covers both, since it is sent after both were created
        expect(mockWaitForInFlightSearch).toHaveBeenCalledTimes(1);
        expect(mockSearch).toHaveBeenCalledTimes(1);
    });

    it('does not fetch a waiting group after the list unmounts', async () => {
        // Given an open group waiting for its running search after an expense was created in it
        const expandedGroups = new Set(['Food']);
        const {rerender, unmount} = renderRefetch({expandedGroups});
        const finishSearch = holdInFlightSearch(FOOD_QUERY?.hash);
        rerender({expandedGroups, newTransactions: [buildTransaction('1', 'Food')]});

        // When the list unmounts before that search finishes
        unmount();
        await finishSearch();

        // Then nothing is fetched for a list that is no longer shown
        expect(mockSearch).not.toHaveBeenCalled();
    });
});
