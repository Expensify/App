/** A `SortableTableHeader` child that turns each column's heading into the column's menu: sorting, and hiding and editing the columns. */
import * as ColumnHeaderMenu from '@components/Table/ColumnHeaderMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

import type {SearchColumnType} from './types';

import {useSortableColumn} from './SortableColumnContext';
import {SortableHeaderLabel} from './SortableHeaderText';

type ColumnEditing = {
    /** The shown columns users can hide from their menu. */
    hidableColumns: ReadonlySet<SearchColumnType>;

    hideColumn: (column: SearchColumnType) => void;

    /** Opens the table's column settings. */
    editColumns: () => void;
};

type SortableColumnMenuProps = {
    /** `undefined` when the table's columns can't be edited, which leaves only sorting in the menu. */
    columnEditing: ColumnEditing | undefined;

    /** Labels the heading that opens the menu. */
    sentryLabel: SentryLabel;

    itemSentryLabels: {
        SORT_ASCENDING: SentryLabel;
        SORT_DESCENDING: SentryLabel;
        HIDE_COLUMN: SentryLabel;
        EDIT_COLUMNS: SentryLabel;
    };
};

function SortableColumnMenu({columnEditing, sentryLabel, itemSentryLabels}: SortableColumnMenuProps) {
    const {columnName, label, alignment, hasResizeHandle, sorting, labelProps} = useSortableColumn();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Columns', 'EyeDisabled']);

    // A menu with nothing in it would only get in the way.
    if (!sorting && !columnEditing) {
        return <SortableHeaderLabel {...labelProps} />;
    }

    return (
        <ColumnHeaderMenu.Root>
            <ColumnHeaderMenu.Trigger
                columnLabel={label}
                alignment={alignment}
                hasResizeHandle={hasResizeHandle}
                sentryLabel={sentryLabel}
            >
                <SortableHeaderLabel {...labelProps} />
            </ColumnHeaderMenu.Trigger>
            <ColumnHeaderMenu.Content>
                {!!sorting && (
                    <ColumnHeaderMenu.SortItems
                        sorting={sorting}
                        sentryLabels={{ascending: itemSentryLabels.SORT_ASCENDING, descending: itemSentryLabels.SORT_DESCENDING}}
                    />
                )}
                {!!sorting && !!columnEditing && <ColumnHeaderMenu.Separator />}
                {!!columnEditing?.hidableColumns.has(columnName) && (
                    <ColumnHeaderMenu.Item
                        text={translate('search.columnMenu.hideColumn')}
                        icon={icons.EyeDisabled}
                        onSelect={() => columnEditing.hideColumn(columnName)}
                        sentryLabel={itemSentryLabels.HIDE_COLUMN}
                    />
                )}
                {!!columnEditing && (
                    <ColumnHeaderMenu.Item
                        text={translate('search.editColumns')}
                        icon={icons.Columns}
                        onSelect={columnEditing.editColumns}
                        sentryLabel={itemSentryLabels.EDIT_COLUMNS}
                    />
                )}
            </ColumnHeaderMenu.Content>
        </ColumnHeaderMenu.Root>
    );
}

export default SortableColumnMenu;
export type {ColumnEditing};
