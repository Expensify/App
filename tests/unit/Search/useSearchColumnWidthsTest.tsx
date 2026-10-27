import {renderHook} from '@testing-library/react-native';

import useSearchColumnWidths from '@components/Search/hooks/useSearchColumnWidths';
import {SearchColumnWidthsProvider, useSearchColumnStyles} from '@components/Search/SearchColumnWidthsContext';
import type {SearchColumnType} from '@components/Search/types';
import {getColumnWidthValue} from '@components/Table/columnResize/columnWidthExpressions';

import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';

import React from 'react';

// Text renders 10px per character, so a column's width follows its heading.
jest.mock('@libs/measureTextWidth', () => ({
    __esModule: true,
    default: (text: string) => text.length * 10,
    canMeasureText: () => true,
}));

const {DATE, MERCHANT, DESCRIPTION, STATUS} = CONST.SEARCH.TABLE_COLUMNS;

const COLUMNS: SearchColumnType[] = [DATE, MERCHANT, DESCRIPTION, STATUS];

function renderSearchColumnWidths(isColumnResizingEnabled: boolean) {
    return renderHook(() => useSearchColumnWidths({columns: COLUMNS, data: [], tableWidth: 1200, isEnabled: true, isColumnResizingEnabled, storedTableColumnWidths: undefined})).result
        .current;
}

describe('useSearchColumnWidths', () => {
    it('sizes the columns exactly as before when resizing is off', () => {
        // Given the same table with resizing off and on
        const withoutResizing = renderSearchColumnWidths(false);
        const withResizing = renderSearchColumnWidths(true);

        // Then turning resizing off lays nothing out for it and leaves the sizing every other path reads unchanged
        expect(withoutResizing.resizableLayout).toBeUndefined();
        expect(withoutResizing.columnWidths).toEqual(withResizing.columnWidths);
    });

    it('lets only the free-text columns resize, not the fixed date or the hugged status badge', () => {
        // When the table is sized with resizing on
        const {resizableLayout} = renderSearchColumnWidths(true);

        // Then only the merchant and description edges drag
        expect(resizableLayout?.resizableColumnKeys).toEqual([MERCHANT, DESCRIPTION]);
    });
});

describe('useSearchColumnStyles', () => {
    it('pins a resizable column to its width custom property, and only a column of the sized table', () => {
        // Given a sized table whose merchant column resizes, rendering a description column of some inner table too
        const wrapper = ({children}: React.PropsWithChildren) => (
            <SearchColumnWidthsProvider
                columnWidths={{[MERCHANT]: {width: 200, minWidth: 100, contentWidth: 200, shouldHug: false}}}
                sizedColumns={new Set([MERCHANT])}
                columnOptions={{}}
                resizableColumnWidths={{[MERCHANT]: 200}}
            >
                {children}
            </SearchColumnWidthsProvider>
        );

        // When both columns resolve their styles
        const getSearchColumnStyles = renderHook(() => useSearchColumnStyles(), {wrapper}).result.current;
        const merchantStyle = getSearchColumnStyles(MERCHANT);
        const descriptionStyle = getSearchColumnStyles(DESCRIPTION);

        // Then merchant reads the width a drag rewrites, without growing or shrinking, and the inner column keeps its styling
        expect(merchantStyle).toMatchObject({width: getColumnWidthValue(MERCHANT, 200), minWidth: getColumnWidthValue(MERCHANT, 200), flexGrow: 0, flexShrink: 0});
        expect(descriptionStyle.width).not.toEqual(getColumnWidthValue(DESCRIPTION, 200));
    });

    it('leaves every column as styled outside the Search table', () => {
        // Given a row rendered with no Search provider, like the Money Request report's
        const {getSearchColumnStyles, StyleUtils} = renderHook(() => ({getSearchColumnStyles: useSearchColumnStyles(), StyleUtils: useStyleUtils()})).result.current;

        // Then a column that resizes in Search keeps exactly the styling it has without the Search table
        expect(getSearchColumnStyles(MERCHANT)).toEqual(StyleUtils.getReportTableColumnStyles(MERCHANT));
    });
});
