import React, {useMemo, useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Expensicons from '@src/components/Icon/Expensicons';
import ROUTES from '@src/ROUTES';
import type {SearchTypeMenuItem} from './SearchTypeMenu';

type SearchTypeMenuNarrowProps = {
    typeMenuItems: SearchTypeMenuItem[];
    activeItemIndex: number;
    title?: string;
};

function SearchTypeMenuNarrow({typeMenuItems, activeItemIndex, title}: SearchTypeMenuNarrowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const openMenu = () => setIsPopoverVisible(true);
    const closeMenu = () => setIsPopoverVisible(false);

    const popoverMenuItems = typeMenuItems.map((item, index) => {
        const isSelected = title ? false : index === activeItemIndex;

        return {
            text: item.title,
            onSelected: singleExecution(() => Navigation.navigate(item.route)),
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
                    <Animated.View style={[styles.tabSelectorButton, styles.tabBackground(hovered, true, theme.border), styles.w100]}>
                        <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, titleViewStyles]}>
                            <Icon
                                src={menuIcon}
                                fill={theme.icon}
                            />
                            <Text
                                numberOfLines={1}
                                style={[styles.textStrong, styles.flexShrink1]}
                            >
                                {menuTitle}
                            </Text>
                            <Icon
                                src={Expensicons.DownArrow}
                                fill={theme.icon}
                            />
                        </View>
                    </Animated.View>
                )}
            </PressableWithFeedback>
            <Button
                icon={Expensicons.Filters}
                onPress={() => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS)}
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
