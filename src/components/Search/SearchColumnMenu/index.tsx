/** A Spend table heading that opens its column's menu when pressed: sorting, hiding and editing the columns, and resetting their sizes. */
import * as PopoverMenu from '@components/PopoverMenu/v2';
import type {HideSearchColumn} from '@components/Search/hooks/useHideSearchColumn';
import {useSortableColumn} from '@components/Search/SortableColumnContext';
import {useColumnResizeController} from '@components/Table/columnResize/ColumnResizeContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';

import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import React from 'react';

import SearchColumnMenuTrigger from './SearchColumnMenuTrigger';

const MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type SearchColumnMenuProps = HideSearchColumn;

/** A `SortableTableHeader` child that turns each column's heading into the column's menu. */
function SearchColumnMenu({hidableColumns, hideColumn}: SearchColumnMenuProps) {
    const {columnName, sorting} = useSortableColumn();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong', 'Checkmark', 'Columns', 'EyeDisabled', 'RotateLeft']);
    const resetColumnWidths = useColumnResizeController()?.resetColumnWidths;

    // `success` colors the checkmark of the active order, and would color the arrow beside it too. The arrow keeps its usual colors.
    const getSortIconFill = (isHovered: boolean) => StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: isHovered}), isMenuIcon: true, isPane: true});

    const isAscendingActive = sorting?.activeSortOrder === CONST.SEARCH.SORT_ORDER.ASC;
    const isDescendingActive = sorting?.activeSortOrder === CONST.SEARCH.SORT_ORDER.DESC;

    return (
        <PopoverMenu.Root>
            <SearchColumnMenuTrigger />
            <PopoverMenu.Content anchorAlignment={MENU_ANCHOR_ALIGNMENT}>
                {!!sorting && (
                    <>
                        <PopoverMenu.Item
                            text={translate('search.columnMenu.sortAscending')}
                            icon={icons.ArrowUpLong}
                            rightIcon={isAscendingActive ? icons.Checkmark : undefined}
                            success={isAscendingActive}
                            iconFill={getSortIconFill}
                            // The checkmark only shows the active order visually.
                            accessibilityState={{selected: isAscendingActive}}
                            onSelect={() => sorting.onSort(CONST.SEARCH.SORT_ORDER.ASC)}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_SORT_ASCENDING}
                        />
                        <PopoverMenu.Item
                            text={translate('search.columnMenu.sortDescending')}
                            icon={icons.ArrowDownLong}
                            rightIcon={isDescendingActive ? icons.Checkmark : undefined}
                            success={isDescendingActive}
                            iconFill={getSortIconFill}
                            accessibilityState={{selected: isDescendingActive}}
                            onSelect={() => sorting.onSort(CONST.SEARCH.SORT_ORDER.DESC)}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_SORT_DESCENDING}
                        />
                        <PopoverMenu.Separator />
                    </>
                )}
                {hidableColumns.has(columnName) && (
                    <PopoverMenu.Item
                        text={translate('search.columnMenu.hideColumn')}
                        icon={icons.EyeDisabled}
                        onSelect={() => hideColumn(columnName)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_HIDE_COLUMN}
                    />
                )}
                <PopoverMenu.Item
                    text={translate('search.editColumns')}
                    icon={icons.Columns}
                    onSelect={() => Navigation.navigate(ROUTES.SEARCH_COLUMNS)}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_EDIT_COLUMNS}
                />
                {!!resetColumnWidths && (
                    <>
                        <PopoverMenu.Separator />
                        <PopoverMenu.Item
                            text={translate('search.columnMenu.resetColumnSizes')}
                            icon={icons.RotateLeft}
                            onSelect={resetColumnWidths}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU_RESET_COLUMN_SIZES}
                        />
                    </>
                )}
            </PopoverMenu.Content>
        </PopoverMenu.Root>
    );
}

export default SearchColumnMenu;
