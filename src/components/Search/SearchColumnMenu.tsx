/** A Spend table heading that opens its column's menu when pressed: sorting, hiding and editing the columns, and resetting their sizes. */
import Icon from '@components/Icon';
import * as PopoverMenu from '@components/PopoverMenu/v2';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {useColumnResizeController} from '@components/Table/columnResize/ColumnResizeContext';
import RESIZE_HANDLE_COLUMN_OVERLAP from '@components/Table/columnResize/resizeHandleColumnOverlap';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';
import {measureSearchHeaderLabelWidth} from '@libs/getSearchColumnContentToMeasure';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {HideSearchColumn} from './hooks/useHideSearchColumn';

import {useSortableColumn} from './SortableColumnContext';
import {SortableHeaderLabel} from './SortableHeaderText';

const MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type SearchColumnMenuProps = HideSearchColumn;

/** The column's heading. Pressing it opens the column menu, which holds the sort options. */
function SearchColumnMenuTrigger() {
    const {label, alignment, hasResizeHandle, labelProps} = useSortableColumn();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const isMenuVisible = PopoverMenu.useIsPopoverVisible();

    // An end-aligned label with no room for the caret before it is laid out as start-aligned, so hovering never moves it.
    const [hasRoomForCaretBeforeLabel, setHasRoomForCaretBeforeLabel] = useState(true);
    // Reserves the sort arrow, so sorting never flips the layout. `null` on native, which can't measure text.
    const labelWidth = alignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END ? measureSearchHeaderLabelWidth(label, styles.gap1.gap) : null;
    const updateCaretRoom =
        labelWidth === null
            ? undefined
            : (event: LayoutChangeEvent) => {
                  const caretWidth = variables.iconSizeExtraSmall + styles.mr1.marginRight;
                  setHasRoomForCaretBeforeLabel(event.nativeEvent.layout.width >= labelWidth + caretWidth);
              };
    const layoutAlignment = alignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END && !hasRoomForCaretBeforeLabel ? CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.START : alignment;
    // The caret goes on the side away from the edge the label is pinned to, so revealing it on hover doesn't move the label.
    const isCaretBeforeLabel = layoutAlignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END;

    return (
        <PopoverMenu.Trigger>
            <PressableWithFeedback
                accessibilityLabel={translate('search.columnMenu.openMenu', {columnName: label})}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU}
                wrapperStyle={[styles.flex1, styles.alignSelfStretch]}
                onWrapperLayout={updateCaretRoom}
                // Fills the cell, so the whole heading opens the menu.
                style={[styles.flex1, styles.alignSelfStretch, styles.justifyContentCenter]}
            >
                {({hovered}) => {
                    const isCaretVisible = hovered && !isMenuVisible;
                    const caret = isCaretVisible && (
                        <View style={isCaretBeforeLabel ? styles.mr1 : styles.ml1}>
                            <Icon
                                src={icons.DownArrow}
                                fill={theme.icon}
                                width={variables.iconSizeExtraSmall}
                                height={variables.iconSizeExtraSmall}
                            />
                        </View>
                    );
                    const labelRow = (
                        <View
                            style={[
                                styles.flexRow,
                                styles.alignItemsCenter,
                                isCaretBeforeLabel && styles.justifyContentEnd,
                                // Keeps the caret out of the resize handle's hit area.
                                isCaretVisible && hasResizeHandle && StyleUtils.getPaddingRight(RESIZE_HANDLE_COLUMN_OVERLAP),
                            ]}
                        >
                            {isCaretBeforeLabel && caret}
                            <View style={styles.flexShrink1}>
                                <SortableHeaderLabel {...labelProps} />
                            </View>
                            {!isCaretBeforeLabel && caret}
                        </View>
                    );

                    if (layoutAlignment !== CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.CENTER) {
                        return labelRow;
                    }

                    // A caret taking room would shift a centered label. The spacer and the slot split the spare room, so the label
                    // rests centered and the caret takes the room after it. The slot never shrinks below the label, so a label
                    // wider than its cell spills past both edges.
                    return (
                        <View style={[styles.flexRow, styles.justifyContentCenter]}>
                            <View style={[styles.flexGrow1, styles.flexBasis0]} />
                            <View style={[styles.flexGrow1, styles.flexShrink0]}>
                                {/* Sizes the slot to the label. */}
                                <View
                                    aria-hidden
                                    style={[styles.opacity0, styles.pointerEventsNone]}
                                >
                                    <SortableHeaderLabel {...labelProps} />
                                </View>
                                <View style={styles.searchColumnMenuLabelOverlay}>{labelRow}</View>
                            </View>
                        </View>
                    );
                }}
            </PressableWithFeedback>
        </PopoverMenu.Trigger>
    );
}

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
