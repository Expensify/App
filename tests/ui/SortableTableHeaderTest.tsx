import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {useSortableColumn} from '@components/Search/SortableColumnContext';
import SortableTableHeader from '@components/Search/SortableTableHeader';
import Text from '@components/Text';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

function ColumnHeading() {
    const {columnName, label} = useSortableColumn();
    return <Text testID={`heading-${columnName}`}>{label}</Text>;
}

function renderHeader() {
    return render(
        <LocaleContextProvider>
            <SortableTableHeader
                columns={[
                    {columnName: CONST.SEARCH.TABLE_COLUMNS.AVATAR, translationKey: undefined, isColumnSortable: false},
                    {columnName: CONST.SEARCH.TABLE_COLUMNS.TITLE, translationKey: 'common.title', isColumnSortable: true},
                ]}
                shouldShowSorting
                shouldShowColumn={() => true}
                onSortPress={() => {}}
                dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            >
                <ColumnHeading />
            </SortableTableHeader>
        </LocaleContextProvider>,
    );
}

describe('SortableTableHeader', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('gives every column a menu heading, naming icon-only ones like the Columns page does', async () => {
        // Given a Spend table header whose Avatar column shows only an icon, next to a labelled column
        // When the header renders with a child that turns each heading into its column menu
        renderHeader();
        await waitForBatchedUpdatesWithAct();

        // Then the icon-only Avatar heading is replaced by the child too, so it opens the column menu like any labelled column,
        // and it is named the same as on the Columns page so screen readers can announce its menu
        expect(screen.getByTestId(`heading-${CONST.SEARCH.TABLE_COLUMNS.AVATAR}`)).toHaveTextContent('Avatar');
        expect(screen.getByTestId(`heading-${CONST.SEARCH.TABLE_COLUMNS.TITLE}`)).toHaveTextContent('Title');
    });
});
