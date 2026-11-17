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
    it('does not fetch when the group opens, because the list fetches it then', () => {
        // Given a closed group
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY});

        // When the list opens it
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // Then the row doesn't fetch it a second time
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('fetches again when an expense is created in an open group', () => {
        // Given an open group
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // When an expense is created in it
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true, newTransactionID: '1'});

        // Then its first page is fetched again so the new expense shows up
        expect(mockSearch).toHaveBeenCalledTimes(1);
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: FOOD_QUERY, offset: 0}));
    });

    it('does not fetch when an expense is created in a closed group', () => {
        // Given a closed group
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY});

        // When an expense is created in it
        rerender({transactionsQueryJSON: FOOD_QUERY, newTransactionID: '1'});

        // Then nothing is fetched, because the list fetches the group when it opens
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('does not fetch when the list reuses the row for another open group', () => {
        // Given a row showing an open group
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // When the list scrolls and reuses the row for another group that is also open and has a new expense
        rerender({transactionsQueryJSON: TRAVEL_QUERY, isExpanded: true, newTransactionID: '1'});

        // Then nothing is fetched, because that group was fetched when it opened and nothing changed in it since
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('does not fetch when a row mounts for an open group that has a new expense', () => {
        // Given an open group with a new expense, scrolled back into view
        // When its row mounts
        renderFetch({transactionsQueryJSON: FOOD_QUERY, isExpanded: true, newTransactionID: '1'});

        // Then nothing is fetched, because the expense didn't arrive while this row was showing the group
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('fetches again when the user comes back to the screen with the group open', () => {
        // Given an open group
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // When the user leaves the screen, for example to edit an expense in the RHP, and comes back
        mockIsScreenFocused.current = false;
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});
        mockIsScreenFocused.current = true;
        rerender({transactionsQueryJSON: FOOD_QUERY, isExpanded: true});

        // Then it fetches again, so its expenses match the totals that may have changed meanwhile
        expect(mockSearch).toHaveBeenCalledTimes(1);
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: FOOD_QUERY, offset: 0}));
    });

    it('does not fetch when the user comes back to the screen with the group closed', () => {
        // Given a closed group
        const {rerender} = renderFetch({transactionsQueryJSON: FOOD_QUERY});

        // When the user leaves the screen and comes back
        mockIsScreenFocused.current = false;
        rerender({transactionsQueryJSON: FOOD_QUERY});
        mockIsScreenFocused.current = true;
        rerender({transactionsQueryJSON: FOOD_QUERY});

        // Then nothing is fetched, because the list fetches the group when it opens
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('does not fetch for an open group that has no search of its own', () => {
        // Given an open group with nothing to fetch, such as an expense report
        const {rerender} = renderFetch({isExpanded: true});

        // When an expense is created in it and the user comes back to the screen
        rerender({isExpanded: true, newTransactionID: '1'});
        mockIsScreenFocused.current = false;
        rerender({isExpanded: true, newTransactionID: '1'});
        mockIsScreenFocused.current = true;
        rerender({isExpanded: true, newTransactionID: '1'});

        // Then no search runs
        expect(mockSearch).not.toHaveBeenCalled();
    });
});
