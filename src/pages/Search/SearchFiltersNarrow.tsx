import React, {useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
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
import type {SearchMenuFilterItem} from './SearchFilters';

type SearchFiltersNarrowProps = {
    filterItems: SearchMenuFilterItem[];
    activeItemLabel: string;
};

function SearchFiltersNarrow({filterItems, activeItemLabel}: SearchFiltersNarrowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const openMenu = () => setIsPopoverVisible(true);
    const closeMenu = () => setIsPopoverVisible(false);

    const activeItem = filterItems.find((item) => item.title.toLowerCase() === activeItemLabel);
    const popoverMenuItems = filterItems.map((item) => ({
        text: item.title,
        onSelected: singleExecution(() => Navigation.navigate(item.route)),
        icon: item.icon,
    }));

    return (
        <>
            <PressableWithFeedback
                accessible
                accessibilityLabel={activeItem?.title ?? ''}
                style={[styles.tabSelectorButton]}
                wrapperStyle={[styles.flex1]}
                ref={buttonRef}
                onPress={openMenu}
            >
                {({hovered}) => (
                    <Animated.View style={[styles.tabSelectorButton, StyleSheet.absoluteFill, styles.tabBackground(hovered, true, theme.border), styles.mh3]}>
                        <View style={[styles.flexRow]}>
                            <Icon
                                src={activeItem?.icon ?? Expensicons.All}
                                fill={theme.icon}
                            />
                            <Text style={[styles.searchFiltersButtonText]}>{activeItem?.title}</Text>
                            <Icon
                                src={Expensicons.DownArrow}
                                fill={theme.icon}
                            />
                        </View>
                    </Animated.View>
                )}
            </PressableWithFeedback>
            <PopoverMenu
                menuItems={popoverMenuItems}
                isVisible={isPopoverVisible}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                onClose={closeMenu}
                onItemSelected={closeMenu}
                anchorRef={buttonRef}
            />
        </>
    );
}

SearchFiltersNarrow.displayName = 'SearchFiltersNarrow';

export default SearchFiltersNarrow;
