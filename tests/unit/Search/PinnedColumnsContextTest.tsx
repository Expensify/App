import {renderHook} from '@testing-library/react-native';

import {getPinnedLeftVariable, PINNED_LEFT_LEAD_VARIABLE} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';
import {PinnedColumnsProvider, usePinnedColumnStyles} from '@components/Search/PinnedColumnsContext';
import {ListScrollAxesContext} from '@components/Search/primitives/ListScrollAxesContext';
import {useSearchColumnStyles} from '@components/Search/SearchColumnWidthsContext';
import type {SearchColumnType} from '@components/Search/types';

import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';

import React from 'react';

// Jest resolves the native styles, which hold nothing in place, so the web ones are loaded by their file name.
jest.mock('@components/Search/pinnedCellStyles', () => jest.requireActual<Record<string, unknown>>('@components/Search/pinnedCellStyles/index.ts'));

const {MERCHANT, CATEGORY, DATE, DESCRIPTION} = CONST.SEARCH.TABLE_COLUMNS;

/** Renders inside a list that scrolls both ways, which is where pins hold still, unless `isScrollingBothAxes` says otherwise. */
function renderWithLeftPins<Result>(leftPinned: SearchColumnType[], callback: () => Result, isScrollingBothAxes = true) {
    const wrapper = ({children}: React.PropsWithChildren) => (
        <ListScrollAxesContext.Provider value={isScrollingBothAxes}>
            <PinnedColumnsProvider leftPinned={leftPinned}>{children}</PinnedColumnsProvider>
        </ListScrollAxesContext.Provider>
    );
    return renderHook(callback, {wrapper}).result.current;
}

describe('usePinnedColumnStyles', () => {
    it('leaves every column and heading alone without left pins', () => {
        // Given a table outside any pinned columns provider, as every table other than the Spend table is

        // When its cells ask how to hold themselves in place
        const pinnedStyles = renderHook(() => usePinnedColumnStyles()).result.current;

        // Then nothing moves or stacks differently, so tables that can't pin columns render exactly as before
        expect(pinnedStyles.getPinnedColumnStyle(MERCHANT)).toBeUndefined();
        expect(pinnedStyles.getPinnedHeadingDataSet(MERCHANT)).toBeUndefined();
        expect(pinnedStyles.leadingStyle).toBeUndefined();
        expect(pinnedStyles.cellContainerStyle).toBeUndefined();
    });

    it('sticks each left pin where it rests and marks the pinned headings the region is measured from', () => {
        // Given Merchant and Category pinned left, in that order
        const pinnedStyles = renderWithLeftPins([MERCHANT, CATEGORY], () => usePinnedColumnStyles());

        // When the pinned and an unpinned column ask for their styles and heading markers
        const merchantStyle = pinnedStyles.getPinnedColumnStyle(MERCHANT);
        const categoryStyle = pinnedStyles.getPinnedColumnStyle(CATEGORY);
        const dateStyle = pinnedStyles.getPinnedColumnStyle(DATE);

        // Then each pin sticks at its own resting offset, above the row's cover, while the rest scroll normally, and only the pinned
        // headings are marked for the region to be measured from
        expect(merchantStyle).toMatchObject({zIndex: 2, position: 'sticky', left: `calc(var(${getPinnedLeftVariable(0)}, 0px))`});
        expect(categoryStyle).toMatchObject({zIndex: 2, position: 'sticky', left: `calc(var(${getPinnedLeftVariable(1)}, 0px))`});
        expect(dateStyle).toBeUndefined();
        expect(pinnedStyles.getPinnedHeadingDataSet(MERCHANT)).toEqual({pinnedHeading: 'true'});
        expect(pinnedStyles.getPinnedHeadingDataSet(CATEGORY)).toEqual({pinnedHeading: 'true'});
        expect(pinnedStyles.getPinnedHeadingDataSet(DATE)).toBeUndefined();
    });

    it('only moves pinned columns to the start where the list scrolls vertically inside an outer horizontal ScrollView', () => {
        // Given Merchant pinned left in a table whose list doesn't scroll sideways itself, where a sticky cell would stick to the wrong scroller
        const pinnedStyles = renderWithLeftPins([MERCHANT], () => usePinnedColumnStyles(), false);

        // When its cells ask how to hold themselves in place
        const merchantStyle = pinnedStyles.getPinnedColumnStyle(MERCHANT);

        // Then nothing sticks, so the pinned column scrolls with the table as it does on native, and its heading is still marked
        expect(merchantStyle).toBeUndefined();
        expect(pinnedStyles.leadingStyle).toBeUndefined();
        expect(pinnedStyles.getPinnedHeadingDataSet(MERCHANT)).toEqual({pinnedHeading: 'true'});
    });

    it('sticks the checkbox where the row content starts', () => {
        // Given a column pinned left, which the checkbox before the columns stays beside
        const pinnedStyles = renderWithLeftPins([DATE], () => usePinnedColumnStyles());

        // When the checkbox asks for its style
        const checkboxStyle = pinnedStyles.leadingStyle;

        // Then it sticks at the row content's resting offset
        expect(checkboxStyle).toMatchObject({zIndex: 2, position: 'sticky', left: `calc(var(${PINNED_LEFT_LEAD_VARIABLE}, 0px))`});
    });
});

describe('useSearchColumnStyles with left pins', () => {
    it('puts the pin on top of the width a column already has', () => {
        // Given Merchant pinned left in a table that sizes its columns from the base column styles
        const {getSearchColumnStyles, StyleUtils} = renderWithLeftPins([MERCHANT], () => ({getSearchColumnStyles: useSearchColumnStyles(), StyleUtils: useStyleUtils()}));

        // When the pinned and an unpinned column resolve their cell styles
        const merchantStyle = getSearchColumnStyles(MERCHANT);
        const descriptionStyle = getSearchColumnStyles(DESCRIPTION);

        // Then the pinned column keeps every sizing property the table gave it, so pinning never changes a column's width, and the
        // unpinned column is untouched
        expect(merchantStyle).toMatchObject({...StyleUtils.getReportTableColumnStyles(MERCHANT), zIndex: 2});
        expect(descriptionStyle).toEqual(StyleUtils.getReportTableColumnStyles(DESCRIPTION));
    });
});
