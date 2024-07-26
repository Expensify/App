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
import type {SearchStatusMenuItem} from './SearchStatusMenu';

type SearchStatusMenuNarrowProps = {
    statusMenuItems: SearchStatusMenuItem[];
    activeItemIndex: number;
    title?: string;
};

function SearchStatusMenuNarrow({statusMenuItems, activeItemIndex, title}: SearchStatusMenuNarrowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const openMenu = () => setIsPopoverVisible(true);
    const closeMenu = () => setIsPopoverVisible(false);

    const popoverMenuItems = statusMenuItems.map((item, index) => ({
        text: item.title,
        onSelected: singleExecution(() => Navigation.navigate(item.route)),
        icon: item.icon,
        iconFill: index === activeItemIndex ? theme.iconSuccessFill : theme.icon,
        iconRight: Expensicons.Checkmark,
        shouldShowRightIcon: index === activeItemIndex,
        success: index === activeItemIndex,
        containerStyle: index === activeItemIndex ? [{backgroundColor: theme.border}] : undefined,
    }));

    const menuIcon = useMemo(() => (title ? Expensicons.Filters : popoverMenuItems[activeItemIndex]?.icon ?? Expensicons.Receipt), [activeItemIndex, popoverMenuItems, title]);
    const menuTitle = useMemo(() => title ?? popoverMenuItems[activeItemIndex]?.text, [activeItemIndex, popoverMenuItems, title]);
    const titleViewStyles = title && {...styles.flex1, ...styles.justifyContentCenter};

    return (
        <View style={[styles.pb4, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5]}>
            <PressableWithFeedback
                accessible
                accessibilityLabel={popoverMenuItems[activeItemIndex]?.text ?? ''}
                ref={buttonRef}
                style={[styles.tabSelectorButton, styles.pl0]}
                wrapperStyle={styles.flex1}
                onPress={openMenu}
            >
                {({hovered}) => (
                    <Animated.View style={[styles.tabSelectorButton, styles.tabBackground(hovered, true, theme.border), styles.w100, styles.mh3]}>
                        <View style={[styles.flexRow, titleViewStyles]}>
                            <Icon
                                src={menuIcon}
                                fill={theme.icon}
                            />
                            <Text
                                numberOfLines={1}
                                style={[styles.mh1, styles.textStrong]}
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
                medium
                innerStyles={styles.searchNarrowFilterButton}
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

SearchStatusMenuNarrow.displayName = 'SearchStatusMenuNarrow';

export default SearchStatusMenuNarrow;
