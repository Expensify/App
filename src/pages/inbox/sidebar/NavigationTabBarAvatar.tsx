import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type NavigationTabBarAvatarProps = {
    isSelected?: boolean;

    /** Function to call when the avatar is pressed */
    onPress: () => void;

    /** Additional styles to add to the button */
    style?: StyleProp<ViewStyle>;
};

function NavigationTabBarAvatar({onPress, isSelected = false, style}: NavigationTabBarAvatarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {status} = useAccountTabIndicatorStatus();

    const accountAccessibilityState = useMemo(() => ({selected: isSelected}), [isSelected]);

    return (
        <PressableWithFeedback
            onPress={onPress}
            accessibilityLabel={`${translate('initialSettingsPage.account')}, ${translate('sidebarScreen.buttonMySettings')}. ${status ? `${translate('common.yourReviewIsRequired')}.` : ''}`}
            role={CONST.ROLE.TAB}
            wrapperStyle={styles.flex1}
            accessibilityState={accountAccessibilityState}
            aria-selected={accountAccessibilityState.selected}
            style={({hovered}) => [style, !shouldUseNarrowLayout && hovered && styles.navigationTabBarItemHovered]}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
        >
            {({hovered}) => (
                <>
                    <View style={styles.tn0Half}>
                        <AccountNavigationAvatar
                            isSelected={isSelected || (!shouldUseNarrowLayout && hovered)}
                            isHovered={hovered}
                        />
                    </View>
                    <Text
                        numberOfLines={2}
                        style={[styles.textSmall, styles.textAlignCenter, isSelected ? styles.textBold : styles.textSupporting, styles.mt0Half, styles.navigationTabBarLabel]}
                    >
                        {translate('initialSettingsPage.account')}
                    </Text>
                </>
            )}
        </PressableWithFeedback>
    );
}

export default NavigationTabBarAvatar;
