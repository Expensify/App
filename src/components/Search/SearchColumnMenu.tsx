/** A Spend table heading that opens its column's menu when pressed: sorting, and hiding and editing the columns. */
import Icon from '@components/Icon';
import * as PopoverMenu from '@components/PopoverMenu/v2';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {GetHideColumnHandler} from './hooks/useHideSearchColumn';

import {useSortableColumn} from './SortableColumnContext';
import {SortableHeaderLabel} from './SortableHeaderText';

const MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type SearchColumnMenuProps = {
    getHideColumnHandler: GetHideColumnHandler;
};

/** Pressing the heading opens the menu rather than sorting, since sorting moved into the menu. */
function SearchColumnMenuTrigger() {
    const {label, style, labelProps} = useSortableColumn();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const isMenuVisible = PopoverMenu.useIsPopoverVisible();

    return (
        <PopoverMenu.Trigger>
            <PressableWithFeedback
                accessibilityLabel={translate('search.columnMenu.openMenu', {columnName: label})}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU}
                wrapperStyle={style}
                // Fills the cell, so the whole heading opens the menu, and places the label where the cell would.
                style={[styles.flex1, styles.alignSelfStretch, styles.justifyContentCenter, {alignItems: StyleSheet.flatten(style)?.alignItems}]}
            >
                {({hovered}) => (
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <View style={styles.flexShrink1}>
                            <SortableHeaderLabel {...labelProps} />
                        </View>
                        {/* Collapsed rather than transparent while hidden, so it doesn't take room from the label. */}
                        <View style={hovered && !isMenuVisible ? styles.ml1 : [StyleUtils.getWidthStyle(0), styles.overflowHidden]}>
                            <Icon
                                src={icons.DownArrow}
                                fill={theme.icon}
                                width={variables.iconSizeExtraSmall}
                                height={variables.iconSizeExtraSmall}
                            />
                        </View>
                    </View>
                )}
            </PressableWithFeedback>
        </PopoverMenu.Trigger>
    );
}

/** A `SortableTableHeader` child that turns each column's heading into the column's menu. */
function SearchColumnMenu({getHideColumnHandler}: SearchColumnMenuProps) {
    const {columnName, sorting} = useSortableColumn();
    const onHideColumn = getHideColumnHandler(columnName);
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong', 'Checkmark', 'Columns', 'EyeDisabled']);

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
                        />
                        <PopoverMenu.Item
                            text={translate('search.columnMenu.sortDescending')}
                            icon={icons.ArrowDownLong}
                            rightIcon={isDescendingActive ? icons.Checkmark : undefined}
                            success={isDescendingActive}
                            iconFill={getSortIconFill}
                            accessibilityState={{selected: isDescendingActive}}
                            onSelect={() => sorting.onSort(CONST.SEARCH.SORT_ORDER.DESC)}
                        />
                        <PopoverMenu.Separator />
                    </>
                )}
                {!!onHideColumn && (
                    <PopoverMenu.Item
                        text={translate('search.columnMenu.hideColumn')}
                        icon={icons.EyeDisabled}
                        onSelect={onHideColumn}
                    />
                )}
                <PopoverMenu.Item
                    text={translate('search.editColumns')}
                    icon={icons.Columns}
                    onSelect={() => Navigation.navigate(ROUTES.SEARCH_COLUMNS)}
                />
            </PopoverMenu.Content>
        </PopoverMenu.Root>
    );
}

export default SearchColumnMenu;
