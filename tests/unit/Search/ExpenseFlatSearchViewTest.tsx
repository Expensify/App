import {render} from '@testing-library/react-native';
import React from 'react';
import ExpenseFlatSearchView from '@components/Search/ExpenseFlatSearchView';
import TransactionListItem from '@components/Search/SearchList/ListItem/TransactionListItem';
import type {SearchQueryJSON} from '@components/Search/types';
import CONST from '@src/CONST';

const mockSearchList = jest.fn();
jest.mock('@components/Search/SearchList', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
        mockSearchList(props);
        return null;
    },
}));

jest.mock('@components/Search/hooks/useSearchSnapshot', () => ({
    __esModule: true,
    default: () => ({data: [{keyForList: '1'}], columns: ['merchant'], isLoading: false, hasMore: false, hasLoadedAllTransactions: true}),
}));

jest.mock('@components/Search/SearchList/ListItem/TransactionListItem', () => ({__esModule: true, default: () => null}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const QUERY_JSON = {hash: 1, type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL} as SearchQueryJSON;

type CapturedSearchListProps = {
    data: unknown;
    columns: unknown;
    hasLoadedAllTransactions: unknown;
    ListItem: unknown;
    shouldAnimate: unknown;
    onSelectRow: unknown;
    canSelectMultiple: unknown;
    queryJSON: unknown;
};

function getCapturedProps(): CapturedSearchListProps {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access
    return (mockSearchList.mock.calls.at(0)?.[0] ?? {}) as CapturedSearchListProps;
}

describe('ExpenseFlatSearchView', () => {
    beforeEach(() => {
        mockSearchList.mockReset();
    });

    it('renders SearchList with the hook data and the flat-expense row component', () => {
        render(
            <ExpenseFlatSearchView
                queryJSON={QUERY_JSON}
                onSelectRow={jest.fn()}
                canSelectMultiple={false}
                isMobileSelectionModeEnabled={false}
            />,
        );

        const props = getCapturedProps();
        expect(props.data).toEqual([{keyForList: '1'}]);
        expect(props.columns).toEqual(['merchant']);
        expect(props.hasLoadedAllTransactions).toBe(true);
        expect(props.ListItem).toBe(TransactionListItem);
        expect(props.shouldAnimate).toBe(true);
    });

    it('passes interaction props through to SearchList', () => {
        const onSelectRow = jest.fn();
        render(
            <ExpenseFlatSearchView
                queryJSON={QUERY_JSON}
                onSelectRow={onSelectRow}
                canSelectMultiple
                isMobileSelectionModeEnabled={false}
            />,
        );

        const props = getCapturedProps();
        expect(props.onSelectRow).toBe(onSelectRow);
        expect(props.canSelectMultiple).toBe(true);
        expect(props.queryJSON).toBe(QUERY_JSON);
    });
});
