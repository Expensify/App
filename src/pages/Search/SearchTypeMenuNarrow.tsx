import React, {useMemo, useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import * as SearchUtils from '@src/libs/SearchUtils';
import ROUTES from '@src/ROUTES';
import type {SearchTypeMenuItem} from './SearchTypeMenu';

type SearchTypeMenuNarrowProps = {
    typeMenuItems: SearchTypeMenuItem[];
    activeItemIndex: number;
    queryJSON: SearchQueryJSON;
    title?: string;
};

function SearchTypeMenuNarrow({typeMenuItems, activeItemIndex, queryJSON, title}: SearchTypeMenuNarrowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const openMenu = () => setIsPopoverVisible(true);
    const closeMenu = () => setIsPopoverVisible(false);
    const onPress = () => {
        const values = SearchUtils.getFiltersFormValues(queryJSON);
        SearchActions.updateAdvancedFilters(values);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    const popoverMenuItems = typeMenuItems.map((item, index) => {
        const isSelected = title ? false : index === activeItemIndex;

        return {
            text: item.title,
            onSelected: singleExecution(() => {
                SearchActions.clearAllFilters();
                Navigation.navigate(item.route);
            }),
            icon: item.icon,
            iconFill: isSelected ? theme.iconSuccessFill : theme.icon,
            iconRight: Expensicons.Checkmark,
            shouldShowRightIcon: isSelected,
            success: isSelected,
            containerStyle: isSelected ? [{backgroundColor: theme.border}] : undefined,
        };
    });

    if (title) {
        popoverMenuItems.push({
            text: title,
            onSelected: closeMenu,
            icon: Expensicons.Filters,
            iconFill: theme.iconSuccessFill,
            success: true,
            containerStyle: [{backgroundColor: theme.border}],
            iconRight: Expensicons.Checkmark,
            shouldShowRightIcon: false,
        });
    }

    const menuIcon = useMemo(() => (title ? Expensicons.Filters : popoverMenuItems[activeItemIndex]?.icon ?? Expensicons.Receipt), [activeItemIndex, popoverMenuItems, title]);
    const menuTitle = useMemo(() => title ?? popoverMenuItems[activeItemIndex]?.text, [activeItemIndex, popoverMenuItems, title]);
    const titleViewStyles = title ? {...styles.flex1, ...styles.justifyContentCenter} : {};

    return (
        <View style={[styles.pb4, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.gap2]}>
            <PressableWithFeedback
                accessible
                accessibilityLabel={popoverMenuItems[activeItemIndex]?.text ?? ''}
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
                menuItems={popoverMenuItems}
                isVisible={isPopoverVisible}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                onClose={closeMenu}
                onItemSelected={closeMenu}
                anchorRef={buttonRef}
            />
        </View>
    );
}

SearchTypeMenuNarrow.displayName = 'SearchTypeMenuNarrow';

export default SearchTypeMenuNarrow;
