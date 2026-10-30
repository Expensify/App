import {fireEvent, render, screen} from '@testing-library/react-native';

import ColumnsSettingsList from '@components/ColumnsSettingsList';
import type {SearchCustomColumnIds} from '@components/Search/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';

import type * as TestHelper from '../utils/TestHelper';

// The default locale context translates every label to an empty string, and the search matches labels.
jest.mock('@hooks/useLocalize', () => {
    const {translateLocal, localeCompare} = jest.requireActual<typeof TestHelper>('../utils/TestHelper');
    return () => ({translate: translateLocal, localeCompare});
});

const ALL_COLUMNS: SearchCustomColumnIds[] = [
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];
const DEFAULT_COLUMNS: SearchCustomColumnIds[] = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];

function renderColumnsList(onSave = jest.fn()) {
    render(
        <NavigationContainer>
            <ColumnsSettingsList
                allColumns={ALL_COLUMNS}
                defaultSelectedColumns={DEFAULT_COLUMNS}
                currentColumns={DEFAULT_COLUMNS}
                requiredColumns={new Set([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT])}
                onSave={onSave}
                type={CONST.SEARCH.DATA_TYPES.EXPENSE}
            />
        </NavigationContainer>,
    );
    return onSave;
}

function search(text: string) {
    fireEvent.changeText(screen.getByLabelText('Search'), text);
}

beforeAll(async () => {
    await IntlStore.load('en');
});

describe('ColumnsSettingsList search', () => {
    it('shows only the columns whose name contains the search text', () => {
        // Given the columns page with several columns
        renderColumnsList();

        // When the user searches with different casing
        search('MERCHANT');

        // Then only the matching column stays listed
        expect(screen.getByText('Merchant')).toBeOnTheScreen();
        expect(screen.queryByText('Date')).not.toBeOnTheScreen();
        expect(screen.queryByText('Category')).not.toBeOnTheScreen();
    });

    it('saves a column checked while a search hid the other columns', () => {
        // Given the columns page where Merchant starts unchecked
        const onSave = renderColumnsList();

        // When the user checks Merchant from a search, then clears the search and saves
        search('chan');
        fireEvent.press(screen.getByText('Merchant'));
        search('');
        fireEvent.press(screen.getByText('Save'));

        // Then the save keeps both the earlier selection and the one made under the search
        expect(onSave).toHaveBeenCalledWith([...DEFAULT_COLUMNS, CONST.SEARCH.TABLE_COLUMNS.MERCHANT]);
    });

    it('shows a no results message when no column matches', () => {
        // Given the columns page
        renderColumnsList();

        // When the user searches for text that no column name contains
        search('zzz');

        // Then the list is replaced by the no results message
        // The message is hidden from screen readers because it is announced separately.
        expect(screen.getByText('No results found', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.queryByText('Date')).not.toBeOnTheScreen();
    });
});
