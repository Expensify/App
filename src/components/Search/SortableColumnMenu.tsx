/** A `SortableTableHeader` child that turns each column's heading into the column's menu: sorting, hiding and editing the columns, and resetting their sizes. */
import ColumnHeaderMenu from '@components/Table/ColumnHeaderMenu';
import {useColumnResizeController} from '@components/Table/columnResize/ColumnResizeContext';

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
        RESET_COLUMN_SIZES: SentryLabel;
    };
};

function SortableColumnMenu({columnEditing, sentryLabel, itemSentryLabels}: SortableColumnMenuProps) {
    const {columnName, label, alignment, hasResizeHandle, sorting, labelProps} = useSortableColumn();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Columns', 'EyeDisabled', 'RotateLeft']);
    const resetColumnWidths = useColumnResizeController()?.resetColumnWidths;
    // The trigger insets the caret along with the label, so the caret sits as close to the label in an editable column as in any other.
    const {innerContainerStyle, ...labelContentProps} = labelProps;

    // A menu with nothing in it would only get in the way.
    if (!sorting && !columnEditing && !resetColumnWidths) {
        return <SortableHeaderLabel {...labelProps} />;
    }

    return (
        <ColumnHeaderMenu.Root>
            <ColumnHeaderMenu.Trigger
                columnLabel={label}
                alignment={alignment}
                hasResizeHandle={hasResizeHandle}
                labelRowStyle={innerContainerStyle}
                isIconOnly={!labelContentProps.text && !!labelContentProps.icon}
                sentryLabel={sentryLabel}
            >
                <SortableHeaderLabel {...labelContentProps} />
            </ColumnHeaderMenu.Trigger>
            <ColumnHeaderMenu.Content alignment={alignment}>
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
                {!!resetColumnWidths && (
                    <>
                        {(!!sorting || !!columnEditing) && <ColumnHeaderMenu.Separator />}
                        <ColumnHeaderMenu.Item
                            text={translate('search.columnMenu.resetColumnSizes')}
                            icon={icons.RotateLeft}
                            onSelect={resetColumnWidths}
                            sentryLabel={itemSentryLabels.RESET_COLUMN_SIZES}
                        />
                    </>
                )}
            </ColumnHeaderMenu.Content>
        </ColumnHeaderMenu.Root>
    );
}

export default SortableColumnMenu;
export type {ColumnEditing};
