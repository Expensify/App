import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import IconAsset from '@src/types/utils/IconAsset';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';

type TabSelectorItemProps = {
    /** Function to call when onPress */
    onPress?: () => void;

    /** Icon to display on tab */
    icon?: IconAsset;

    /** Title of the tab */
    title?: string;

    /** Whether this tab is active */
    isFocused?: boolean;

    /** Whether animations should be skipped */
    animationEnabled?: boolean;
};

function TabSelectorItem({icon, title = '', onPress = () => {}, isFocused = false, animationEnabled = true}: TabSelectorItemProps) {
    const focusValueRef = useRef(new Animated.Value(isFocused ? 1 : 0));
    const styles = useThemeStyles();
    const theme = useTheme();

    useEffect(() => {
        const focusValue = isFocused ? 1 : 0;

        if (animationEnabled) {
            return Animated.timing(focusValueRef.current, {
                toValue: focusValue,
                duration: CONST.ANIMATED_TRANSITION,
                useNativeDriver: true,
            }).start();
        }

        focusValueRef.current.setValue(focusValue);
    }, [animationEnabled, isFocused]);

    const getBackgroundColorStyle = useCallback(
        (hovered: boolean) => {
            if (hovered && !isFocused) {
                return {backgroundColor: theme.highlightBG};
            }
            return {backgroundColor: focusValueRef.current.interpolate({inputRange: [0, 1], outputRange: [theme.appBG, theme.border]})};
        },
        [theme, isFocused],
    );

    const activeOpacityValue = focusValueRef.current;
    const inactiveOpacityValue = focusValueRef.current.interpolate({inputRange: [0, 1], outputRange: [1, 0]});

    return (
        <PressableWithFeedback
            accessibilityLabel={title}
            style={[styles.tabSelectorButton]}
            wrapperStyle={[styles.flex1]}
            onPress={onPress}
        >
            {({hovered}) => (
                <Animated.View style={[styles.tabSelectorButton, StyleSheet.absoluteFill, getBackgroundColorStyle(hovered)]}>
                    <TabIcon
                        icon={icon}
                        activeOpacity={activeOpacityValue}
                        inactiveOpacity={inactiveOpacityValue}
                    />
                    <TabLabel
                        title={title}
                        activeOpacity={activeOpacityValue}
                        inactiveOpacity={inactiveOpacityValue}
                    />
                </Animated.View>
            )}
        </PressableWithFeedback>
    );
}

TabSelectorItem.displayName = 'TabSelectorItem';

export default TabSelectorItem;
