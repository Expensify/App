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

    /** Whether the avatar is rendered inside the floating (mWeb landscape) tab bar, which lays the label out beside it */
    isFloating?: boolean;
};

function NavigationTabBarAvatar({onPress, isSelected = false, style, isFloating = false}: NavigationTabBarAvatarProps) {
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
            wrapperStyle={shouldUseNarrowLayout ? styles.navigationTabBarSlot : styles.flex1}
            accessibilityState={accountAccessibilityState}
            aria-selected={accountAccessibilityState.selected}
            style={({hovered}) => [style, !shouldUseNarrowLayout && hovered && styles.navigationTabBarItemHovered]}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
        >
            {({hovered}) => (
                <View
                    style={
                        isFloating
                            ? styles.navigationTabBarFloatingItem
                            : [
                                  styles.navigationTabBarItem,
                                  shouldUseNarrowLayout && styles.navigationTabBarItemNarrow,
                                  shouldUseNarrowLayout && isSelected && styles.navigationTabBarItemSelected,
                              ]
                    }
                >
                    <View style={shouldUseNarrowLayout ? styles.navigationTabBarAvatar : styles.tn0Half}>
                        <AccountNavigationAvatar
                            // The floating bar marks the selected tab with a pill behind the whole item, so the
                            // avatar's own ring would double up on it. The side bar and the mWeb landscape pill have
                            // no selected pill and keep it.
                            isSelected={isFloating ? isSelected : !shouldUseNarrowLayout && (isSelected || hovered)}
                            isHovered={hovered}
                            size={shouldUseNarrowLayout ? CONST.AVATAR_SIZE.X_SMALL : CONST.AVATAR_SIZE.SMALL}
                        />
                    </View>
                    <Text
                        numberOfLines={shouldUseNarrowLayout ? 1 : 2}
                        style={[
                            styles.textSmall,
                            isSelected ? styles.textBold : styles.textSupporting,
                            isFloating ? styles.navigationTabBarFloatingLabel : [styles.textAlignCenter, shouldUseNarrowLayout ? styles.mt1 : styles.mt0Half, styles.navigationTabBarLabel],
                        ]}
                    >
                        {translate('initialSettingsPage.account')}
                    </Text>
                </View>
            )}
        </PressableWithFeedback>
    );
}

export default NavigationTabBarAvatar;
