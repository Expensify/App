import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import type {TextStyle, ViewStyle} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import type {MenuItemBaseProps} from '@components/MenuItem';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchTypeMenuItem} from './SearchTypeMenu';

type SavedSearchMenuItem = MenuItemBaseProps & {
    key: string;
    hash: string;
    query: string;
    styles: Array<ViewStyle | TextStyle>;
};

type SearchTypeMenuNarrowProps = {
    typeMenuItems: SearchTypeMenuItem[];
    activeItemIndex: number;
    queryJSON: SearchQueryJSON;
    title?: string;
    savedSearchesMenuItems: SavedSearchMenuItem[];
};

function SearchTypeMenuNarrow({typeMenuItems, activeItemIndex, queryJSON, title, savedSearchesMenuItems}: SearchTypeMenuNarrowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    const {hash} = queryJSON;
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const openMenu = useCallback(() => setIsPopoverVisible(true), []);
    const closeMenu = useCallback(() => setIsPopoverVisible(false), []);
    const onPress = () => {
        const values = SearchUtils.getFiltersFormValues(queryJSON);
        SearchActions.updateAdvancedFilters(values);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    const currentSavedSearch = savedSearchesMenuItems.find((item) => Number(item.hash) === hash);

    const popoverMenuItems = useMemo(() => {
        const items = typeMenuItems.map((item, index) => {
            const isSelected = title ? false : index === activeItemIndex;

            return {
                text: item.title,
                onSelected: singleExecution(() => {
                    SearchActions.clearAllFilters();
                    Navigation.navigate(item.route);
                }),
                isSelected,
                icon: item.icon,
                iconFill: isSelected ? theme.iconSuccessFill : theme.icon,
                iconRight: Expensicons.Checkmark,
                shouldShowRightIcon: isSelected,
                success: isSelected,
                containerStyle: isSelected ? [{backgroundColor: theme.border}] : undefined,
            };
        });

        if (title) {
            items.push({
                text: title,
                onSelected: closeMenu,
                isSelected: !currentSavedSearch,
                icon: Expensicons.Filters,
                iconFill: theme.iconSuccessFill,
                success: true,
                containerStyle: undefined,
                iconRight: Expensicons.Checkmark,
                shouldShowRightIcon: false,
            });
        }

        return items;
    }, [typeMenuItems, activeItemIndex, title, theme, singleExecution, closeMenu, currentSavedSearch]);

    const menuIconAndTitle = useMemo(() => {
        if (title) {
            return {
                icon: Expensicons.Filters,
                title,
            };
        }

        const item = popoverMenuItems.at(activeItemIndex);
        return {
            icon: item?.icon ?? Expensicons.Receipt,
            title: item?.text,
        };
    }, [activeItemIndex, popoverMenuItems, title]);

    const menuIcon = menuIconAndTitle.icon;
    const menuTitle = menuIconAndTitle.title;

    const titleViewStyles = useMemo(() => (title ? {...styles.flex1, ...styles.justifyContentCenter} : {}), [title, styles]);

    const savedSearchItems = savedSearchesMenuItems.map((item) => ({
        text: item.title ?? '',
        styles: [styles.textSupporting],
        onSelected: item.onPress,
        shouldShowRightComponent: true,
        rightComponent: (
            <ThreeDotsMenu
                menuItems={SearchUtils.getOverflowMenu(item.title ?? '', Number(item.hash ?? ''), item.query ?? '', showDeleteModal, true, closeMenu)}
                anchorPosition={{horizontal: 0, vertical: 380}}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
            />
        ),
        isSelected: currentSavedSearch?.hash === item.hash,
    }));

    const allMenuItems = [];
    allMenuItems.push(...popoverMenuItems);

    if (savedSearchesMenuItems.length > 0) {
        allMenuItems.push({
            text: translate('search.savedSearchesMenuItemTitle'),
            styles: [styles.textSupporting],
            disabled: true,
        });
        allMenuItems.push(...savedSearchItems);
    }

    return (
        <View style={[styles.pb4, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.gap2]}>
            <PressableWithFeedback
                accessible
                accessibilityLabel={popoverMenuItems.at(activeItemIndex)?.text ?? ''}
                ref={buttonRef}
                wrapperStyle={styles.flex1}
                onPress={openMenu}
            >
                {({hovered}) => (
                    <Animated.View style={[styles.tabSelectorButton, styles.tabBackground(hovered, true, theme.border), styles.w100, StyleUtils.getHeight(variables.componentSizeNormal)]}>
                        <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, titleViewStyles]}>
                            <Icon
                                src={menuIcon}
                                fill={theme.icon}
                                small
                            />
                            <Text
                                numberOfLines={1}
                                style={[styles.textStrong, styles.flexShrink1, styles.fontSizeLabel]}
                            >
                                {menuTitle}
                            </Text>
                            <Icon
                                src={Expensicons.DownArrow}
                                fill={theme.icon}
                                small
                            />
                        </View>
                    </Animated.View>
                )}
            </PressableWithFeedback>
            <Button
                icon={Expensicons.Filters}
                onPress={onPress}
            />
            <PopoverMenu
                menuItems={allMenuItems as PopoverMenuItem[]}
                isVisible={isPopoverVisible}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                onClose={closeMenu}
                onItemSelected={closeMenu}
                anchorRef={buttonRef}
            />
            <DeleteConfirmModal />
        </View>
    );
}

SearchTypeMenuNarrow.displayName = 'SearchTypeMenuNarrow';

export default SearchTypeMenuNarrow;
