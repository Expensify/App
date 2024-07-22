import React, {useRef, useState} from 'react';
import {Animated, View} from 'react-native';
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
import type {SearchStatusMenuItem} from './SearchStatusMenu';

type SearchResultsStatusMenuNarrowProps = {
    filterItems: SearchStatusMenuItem[];
    activeItemIndex: number;
    title: string;
};

function SearchResultsStatusMenuNarrow({filterItems, activeItemIndex, title}: SearchResultsStatusMenuNarrowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const openMenu = () => setIsPopoverVisible(true);
    const closeMenu = () => setIsPopoverVisible(false);

    const popoverMenuItems = filterItems.map((item, index) => ({
        text: item.title,
        onSelected: singleExecution(() => Navigation.navigate(item.route)),
        icon: item.icon,
        iconFill: index === activeItemIndex ? theme.iconSuccessFill : theme.icon,
        iconRight: Expensicons.Checkmark,
        shouldShowRightIcon: index === activeItemIndex,
        success: index === activeItemIndex,
        containerStyle: index === activeItemIndex ? [{backgroundColor: theme.border}] : undefined,
    }));

    return (
        <View style={[styles.pb4]}>
            <PressableWithFeedback
                accessible
                accessibilityLabel={popoverMenuItems[activeItemIndex]?.text ?? ''}
                ref={buttonRef}
                style={[styles.tabSelectorButton, styles.ph5]}
                onPress={openMenu}
            >
                {({hovered}) => (
                    <Animated.View style={[styles.tabSelectorButton, styles.tabBackground(hovered, true, theme.border), styles.w100, styles.mh3]}>
                        <View style={[styles.flexRow, styles.flex1, styles.justifyContentCenter]}>
                            <Icon
                                src={Expensicons.Filters}
                                fill={theme.icon}
                            />
                            <Text
                                numberOfLines={1}
                                style={[styles.mh1, styles.textStrong]}
                            >
                                {title}
                            </Text>
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
        </View>
    );
}

SearchResultsStatusMenuNarrow.displayName = 'SearchResultsStatusMenuNarrow';

export default SearchResultsStatusMenuNarrow;
