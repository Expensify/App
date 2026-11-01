import Icon from '@components/Icon';
import getTabIconFill from '@components/Navigation/NavigationTabBar/getTabIconFill';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type FlatNavItemProps = {
    /** Translated row label */
    label: string;

    icon?: IconAsset;

    /** Rendered in place of the icon, e.g. the account avatar */
    leftElement?: React.ReactNode;

    isSelected: boolean;

    /** Dot drawn on the icon when the destination needs the user's attention */
    statusIndicatorColor?: string;

    accessibilityLabel?: string;

    sentryLabel: string;

    testID?: string;

    onPress: () => void;
};

/** Full-width row of the flat navigation bar: an icon or avatar, then the destination's label. */
function FlatNavItem({label, icon, leftElement, isSelected, statusIndicatorColor, accessibilityLabel, sentryLabel, testID, onPress}: FlatNavItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const getStatusIndicatorBorderStyle = (isHovered: boolean): StyleProp<ViewStyle> => {
        if (isSelected) {
            return {borderColor: theme.hoverComponentBG};
        }
        return isHovered ? {borderColor: theme.highlightBG} : undefined;
    };

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{selected: isSelected}}
            sentryLabel={sentryLabel}
            testID={testID}
            style={({hovered}) => [styles.flatNavigationBarItem, isSelected && styles.flatNavigationBarItemSelected, hovered && !isSelected && styles.flatNavigationBarItemHovered]}
        >
            {({hovered}) => (
                <>
                    {!!icon && (
                        <View>
                            <Icon
                                src={icon}
                                fill={getTabIconFill(isSelected, hovered, theme)}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                            {!!statusIndicatorColor && (
                                <View
                                    testID="FlatNavItemStatusIndicator"
                                    style={[
                                        styles.navigationTabBarStatusIndicator,
                                        styles.statusIndicatorColor(statusIndicatorColor),
                                        // The dot's stroke reads as a gap cut out of the row, so it takes the row's background.
                                        getStatusIndicatorBorderStyle(hovered),
                                    ]}
                                />
                            )}
                        </View>
                    )}
                    {leftElement}
                    <Text
                        variant={isSelected ? 'textStrong' : 'text'}
                        color={isSelected || hovered ? theme.text : theme.textSupporting}
                        numberOfLines={1}
                        style={styles.flex1}
                    >
                        {label}
                    </Text>
                </>
            )}
        </PressableWithFeedback>
    );
}

export default FlatNavItem;
