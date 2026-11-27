import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PinnedColumnsProvider} from '@components/Search/PinnedColumnsContext';
import {ListScrollAxesContext} from '@components/Search/primitives/ListScrollAxesContext';
import ExpenseReportListItemAvatar from '@components/Search/SearchList/ListItem/ExpenseReportListItemRow/ExpenseReportListItemAvatar';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

// Jest resolves the native styles, which hold nothing in place, so the web ones are loaded by their file name.
jest.mock('@components/Search/pinnedCellStyles', () => jest.requireActual<Record<string, unknown>>('@components/Search/pinnedCellStyles/index.ts'));

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the cell only reads the row key and its avatars
const REPORT_ROW = {
    keyForList: 'report_1',
    primaryAvatar: {source: 'https://example.com/avatar.png', type: CONST.ICON_TYPE_AVATAR, name: 'Ann', id: 1},
} as unknown as ExpenseReportListItemType;

function renderAvatarCell(leftPinned: SearchColumnType[]) {
    const {root} = render(
        <OnyxListItemProvider>
            {/* Pins only hold still in a list that scrolls both ways, as the Reports table does on web. */}
            <ListScrollAxesContext.Provider value>
                <PinnedColumnsProvider leftPinned={leftPinned}>
                    <ExpenseReportListItemAvatar item={REPORT_ROW} />
                </PinnedColumnsProvider>
            </ListScrollAxesContext.Provider>
        </OnyxListItemProvider>,
    );
    // The providers render no views of their own, so the root is the cell.
    return StyleSheet.flatten(root.props.style as Parameters<typeof StyleSheet.flatten>[0]);
}

describe('ExpenseReportListItemAvatar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('holds the Avatar cell in place with its heading when the column is pinned left', () => {
        // Given the Reports table with its Avatar column pinned left, whose heading already holds still while the table scrolls

        // When a report row renders its Avatar cell
        const cellStyle = renderAvatarCell([CONST.SEARCH.TABLE_COLUMNS.AVATAR]);

        // Then the cell sticks where the first pin rests, above the row's cover, instead of sliding beneath it and leaving the
        // pinned column empty
        expect(cellStyle).toMatchObject({zIndex: 2, position: 'sticky', left: 'calc(var(--table-pinned-left-0, 0px))'});
    });

    it('leaves the Avatar cell alone when another column is pinned', () => {
        // Given the Reports table with only its Title column pinned left

        // When a report row renders its Avatar cell
        const cellStyle = renderAvatarCell([CONST.SEARCH.TABLE_COLUMNS.TITLE]);

        // Then the cell scrolls with the rest of the columns
        expect(cellStyle).not.toHaveProperty('position', 'sticky');
    });
});
