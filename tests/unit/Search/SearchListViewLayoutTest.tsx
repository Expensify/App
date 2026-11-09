import {render} from '@testing-library/react-native';

import SearchListViewLayout from '@components/Search/SearchListViewLayout';
import type {SearchColumnType} from '@components/Search/types';
import useStoredColumnWidths from '@components/Table/columnResize/useStoredColumnWidths';

import type {SearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';

import React from 'react';

const mockSearchQueryContext: {currentSearchKey: SearchKey | undefined} = {currentSearchKey: undefined};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockSearchQueryContext,
}));

jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => true}));

jest.mock('@libs/measureTextWidth', () => ({
    __esModule: true,
    default: (text: string) => text.length * 10,
    canMeasureText: () => true,
}));

jest.mock('@components/Table/columnResize/useStoredColumnWidths', () => ({
    __esModule: true,
    default: jest.fn(() => undefined),
}));

const COLUMNS: SearchColumnType[] = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.TITLE, CONST.SEARCH.TABLE_COLUMNS.TOTAL];

function renderLayoutFor(searchKey: SearchKey) {
    mockSearchQueryContext.currentSearchKey = searchKey;

    render(
        <SearchListViewLayout
            columns={COLUMNS}
            type={CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}
            isActionColumnWide={false}
            columnSizeOptions={{}}
            isHeaderVisible
            dataKey={undefined}
            isKeyboardShown={false}
            safeAreaPaddingBottomStyle={{}}
            containerStyle={{}}
            data={[]}
        >
            {null}
        </SearchListViewLayout>,
    );
}

describe('SearchListViewLayout', () => {
    beforeEach(() => {
        jest.mocked(useStoredColumnWidths).mockClear();
        mockSearchQueryContext.currentSearchKey = undefined;
    });

    it('reads the column widths saved for the current search, not for every search of its data type', () => {
        // Given two searches with the same data type, so their tables show the same columns
        const reportsSearchKey = CONST.SEARCH.SEARCH_KEYS.REPORTS;
        const submitSearchKey = CONST.SEARCH.SEARCH_KEYS.SUBMIT;

        // When the table is rendered for each of them
        renderLayoutFor(reportsSearchKey);
        renderLayoutFor(submitSearchKey);

        // Then each one reads its own widths, so resizing a column on Reports leaves Submit untouched
        expect(useStoredColumnWidths).toHaveBeenCalledWith('search:expense-report:reports');
        expect(useStoredColumnWidths).toHaveBeenCalledWith('search:expense-report:submit');
        expect(useStoredColumnWidths).not.toHaveBeenCalledWith('search:expense-report');
    });
});
