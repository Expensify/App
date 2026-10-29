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

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {SortOrder} from './types';

const MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type SearchColumnMenuSorting = {
    /** `undefined` when the table is sorted by another column. */
    activeSortOrder: SortOrder | undefined;

    onSort: (sortOrder: SortOrder) => void;
};

type SearchColumnMenuProps = {
    /** The column's heading, which names the trigger for assistive technologies. */
    columnLabel: string;

    /** Lays out the heading cell, which is the trigger as a whole. */
    style?: StyleProp<ViewStyle>;

    /** `undefined` when the column doesn't sort. */
    sorting: SearchColumnMenuSorting | undefined;

    /** `undefined` when the column can't be hidden. */
    onHideColumn: (() => void) | undefined;

    /** The heading's label. Pressing it opens the menu rather than sorting, since sorting moved into the menu. */
    children: React.ReactNode;
};

function SearchColumnMenuTrigger({columnLabel, style, children}: Pick<SearchColumnMenuProps, 'columnLabel' | 'style' | 'children'>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const isMenuVisible = PopoverMenu.useIsPopoverVisible();

    return (
        <PopoverMenu.Trigger>
            <PressableWithFeedback
                accessibilityLabel={translate('search.columnMenu.openMenu', {columnName: columnLabel})}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU}
                wrapperStyle={style}
                // Fills the cell, so the whole heading opens the menu, and places the label where the cell would.
                style={[styles.flex1, styles.alignSelfStretch, styles.justifyContentCenter, {alignItems: StyleSheet.flatten(style)?.alignItems}]}
            >
                {({hovered}) => (
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <View style={styles.flexShrink1}>{children}</View>
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

function SearchColumnMenu({columnLabel, style, sorting, onHideColumn, children}: SearchColumnMenuProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong', 'Checkmark', 'Columns', 'EyeDisabled']);

    // `success` colors the checkmark of the active order, and would color the arrow beside it too. The arrow keeps its usual colors.
    const getSortIconFill = (isHovered: boolean) => StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: isHovered}), isMenuIcon: true, isPane: true});

    const sortItems = [
        {sortOrder: CONST.SEARCH.SORT_ORDER.ASC, text: translate('search.columnMenu.sortAscending'), icon: icons.ArrowUpLong},
        {sortOrder: CONST.SEARCH.SORT_ORDER.DESC, text: translate('search.columnMenu.sortDescending'), icon: icons.ArrowDownLong},
    ];

    return (
        <PopoverMenu.Root>
            <SearchColumnMenuTrigger
                columnLabel={columnLabel}
                style={style}
            >
                {children}
            </SearchColumnMenuTrigger>
            <PopoverMenu.Content anchorAlignment={MENU_ANCHOR_ALIGNMENT}>
                {!!sorting && (
                    <>
                        {sortItems.map(({sortOrder, text, icon}) => (
                            <PopoverMenu.Item
                                key={sortOrder}
                                text={text}
                                icon={icon}
                                rightIcon={sorting.activeSortOrder === sortOrder ? icons.Checkmark : undefined}
                                success={sorting.activeSortOrder === sortOrder}
                                iconFill={getSortIconFill}
                                onSelect={() => sorting.onSort(sortOrder)}
                            />
                        ))}
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
