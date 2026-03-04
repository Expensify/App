import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type SearchTypeMenuItemProps = {
    /** Translated title */
    title: string;

    /** Icon component or asset */
    icon: IconAsset | undefined;

    /** Optional badge text (e.g. count) */
    badgeText?: string;

    /** Whether the item is focused (keyboard nav) */
    focused?: boolean;

    /** Press handler */
    onPress: () => void;

    /** Wrapper style override */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Badge container style override */
    badgeStyle?: StyleProp<ViewStyle>;

    /** Sentry label for the pressable */
    sentryLabel?: string;
};

/**
 * Menu item row for Search type menu
 */
function SearchTypeMenuItem({title, icon, badgeText, focused = false, onPress, wrapperStyle, badgeStyle, isBadgeSuccess, sentryLabel}: SearchTypeMenuItemProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <PressableWithoutFeedback
            onPress={onPress}
            accessibilityLabel={title}
            role={CONST.ROLE.BUTTON}
            sentryLabel={sentryLabel}
            style={({hovered, pressed}) => [
                styles.flexRow,
                styles.sectionMenuItem,
                StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || hovered, pressed, false, false, true), true),
                hovered && !focused && !pressed && styles.hoveredComponentBG,
                ...(Array.isArray(wrapperStyle) ? wrapperStyle : [wrapperStyle]),
            ]}
        >
            {({hovered, pressed}) => (
                <>
                    {icon != null && (
                        <View style={[styles.popoverMenuIcon, styles.wAuto]}>
                            <Icon
                                src={icon}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                                fill={StyleUtils.getIconFillColor(getButtonState(focused || hovered, pressed, false, false, true), true, true)}
                            />
                        </View>
                    )}
                    <View style={[styles.justifyContentCenter, styles.flex1, styles.ml3]}>
                        <Text
                            style={[styles.popoverMenuText, styles.textStrong]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                    </View>
                    {!!badgeText && (
                        <Badge
                            text={badgeText}
                            badgeStyles={badgeStyle}
                            success
                        />
                    )}
                </>
            )}
        </PressableWithoutFeedback>
    );
}

export default SearchTypeMenuItem;
