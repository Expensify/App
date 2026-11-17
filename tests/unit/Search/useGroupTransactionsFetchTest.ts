import {renderHook} from '@testing-library/react-native';

import useGroupTransactionsFetch from '@components/Search/SearchList/ListItem/useGroupTransactionsFetch';
import type {SearchQueryJSON} from '@components/Search/types';

import {search} from '@libs/actions/Search';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

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

type HookProps = {
    transactionsQueryJSON?: SearchQueryJSON;
    isExpanded?: boolean;
    newTransactionID?: string;
};

function renderFetch(initialProps: HookProps) {
    return renderHook(
        ({transactionsQueryJSON, isExpanded = false, newTransactionID}: HookProps) => useGroupTransactionsFetch({transactionsQueryJSON, isLoading: false, isExpanded, newTransactionID}),
        {initialProps},
    );
}

beforeEach(() => {
    mockSearch.mockClear();
    mockIsScreenFocused.current = true;
});

describe('useGroupTransactionsFetch', () => {
    it('fetches the first page once when the group opens', () => {
        // Given a closed group, which must not fetch anything until the user opens it
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY});
        expect(mockSearch).not.toHaveBeenCalled();

        // When the group opens
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // Then its own search runs from the first page
        expect(mockSearch).toHaveBeenCalledTimes(1);
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: FOOD_QUERY, offset: 0}));
    });

    it('fetches only once when a group with a new expense opens', () => {
        // Given a closed group that already has a new expense, so both the open and the new expense could ask to fetch
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY, newTransactionID: '1'});

        // When the group opens
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true, newTransactionID: '1'});

        // Then it fetches once, because a second request for the same page would be wasted
        expect(mockSearch).toHaveBeenCalledTimes(1);
    });

    it('fetches again when the list reuses an open row for another open group', () => {
        // Given an open group that has fetched its expenses
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // When the list reuses the row for another group that is also open
        rerender({transactionsQueryJSON: TRAVEL_QUERY, isExpanded: true});

        // Then the other group's expenses are fetched, since the row would otherwise show none
        expect(mockSearch).toHaveBeenCalledTimes(2);
        expect(mockSearch).toHaveBeenLastCalledWith(expect.objectContaining({queryJSON: TRAVEL_QUERY}));
    });

    it('fetches again when an expense is created in an open group', () => {
        // Given an open group that has fetched its expenses
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // When an expense is created in it
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true, newTransactionID: '1'});

        // Then it fetches again so the new expense shows up
        expect(mockSearch).toHaveBeenCalledTimes(2);
    });

    it('does not fetch when an expense is created in a closed group', () => {
        // Given a closed group
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY});

        // When an expense is created in it
        rerender({transactionsQueryJSON: FOOD_QUERY, newTransactionID: '1'});

        // Then nothing is fetched, because the group fetches when it opens
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('fetches again when the user comes back to the screen with the group open', () => {
        // Given an open group that has fetched its expenses
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // When the user leaves the screen, for example to edit an expense in the RHP, and comes back
        mockIsScreenFocused.current = false;
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});
        mockIsScreenFocused.current = true;
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // Then it fetches again, so its expenses match the totals that may have changed meanwhile
        expect(mockSearch).toHaveBeenCalledTimes(2);
    });

    it('does not fetch when the user comes back to the screen with the group closed', () => {
        // Given a closed group
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY});

        // When the user leaves the screen and comes back
        mockIsScreenFocused.current = false;
        rerender({transactionsQueryJSON: FOOD_QUERY});
        mockIsScreenFocused.current = true;
        rerender({transactionsQueryJSON: FOOD_QUERY});

        // Then nothing is fetched, because the group fetches when it opens
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('does not fetch for an open group that has no search of its own', () => {
        // Given a group with nothing to fetch, such as an expense report
        const {rerender} = renderFetch({});

        // When it opens
        rerender({isExpanded: true});

        // Then no search runs
        expect(mockSearch).not.toHaveBeenCalled();
    });
});
