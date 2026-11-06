import Icon from '@components/Icon';
import getTabIconFill from '@components/Navigation/NavigationTabBar/getTabIconFill';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ColorValue} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type FlatNavItemProps = {
    /** Translated row label */
    label: string;

    icon?: IconAsset;

    /** Draws what goes in place of the icon, e.g. the account avatar. Gets the row's current background, undefined when the row shows the bar's own. */
    renderLeftElement?: (rowState: {backgroundColor: ColorValue | undefined}) => React.ReactNode;

    /** Drawn after the label, at the row's end */
    rightElement?: React.ReactNode;

    isSelected: boolean;

    /** Draws the row taller than the destination rows, as the Account row is */
    isTall?: boolean;

    /** Dot drawn on the icon when the destination needs the user's attention */
    statusIndicatorColor?: string;

    /** Spoken name of the row, defaults to label */
    accessibilityLabel?: string;

    sentryLabel: SentryLabel;

    onPress: () => void;
};

/** Full-width row of the flat navigation bar: an icon or avatar, then the destination's label. */
function FlatNavItem({label, icon, renderLeftElement, rightElement, isSelected, isTall = false, statusIndicatorColor, accessibilityLabel, sentryLabel, onPress}: FlatNavItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const getRowBackgroundStyle = (isHovered: boolean) => {
        if (isSelected) {
            return styles.hoveredComponentBG;
        }
        return isHovered ? styles.highlightBG : undefined;
    };

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{selected: isSelected}}
            sentryLabel={sentryLabel}
            style={({hovered}) => [styles.flatNavigationBarItem, isTall && styles.flatNavigationBarAccountItem, getRowBackgroundStyle(hovered)]}
        >
            {({hovered}) => {
                const rowBackgroundColor = getRowBackgroundStyle(hovered)?.backgroundColor;
                return (
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
                                            !!rowBackgroundColor && StyleUtils.getBorderColorStyle(rowBackgroundColor),
                                        ]}
                                    />
                                )}
                            </View>
                        )}
                        {renderLeftElement?.({backgroundColor: rowBackgroundColor})}
                        <Text
                            variant={isSelected ? 'textStrong' : 'text'}
                            color={isSelected || hovered ? theme.text : theme.textSupporting}
                            numberOfLines={1}
                            style={styles.flex1}
                        >
                            {label}
                        </Text>
                        {rightElement}
                    </>
                );
            }}
        </PressableWithFeedback>
    );
}

export default FlatNavItem;
