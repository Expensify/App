import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useMemo} from 'react';

import AvatarWithDelegateAvatar from './AvatarWithDelegateAvatar';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

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
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const delegateEmail = account?.delegatedAccess?.delegate ?? '';
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const emojiStatus = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {status} = useAccountTabIndicatorStatus();

    /**
     * Renders the appropriate avatar component based on user state (delegate, emoji status, or default profile)
     * with the correct active (ring) state for selection and hover effects.
     */
    // The avatar carries a -2 top nudge that balances it against the label. Narrow layout drops the
    // label, so the nudge is cancelled there to keep the avatar centered in the tab.
    const avatarOffsetStyle = shouldUseNarrowLayout ? styles.t0 : styles.tn0Half;

    const renderAvatar = (active: boolean, isHovered: boolean) => {
        if (delegateEmail) {
            return (
                <AvatarWithDelegateAvatar
                    delegateEmail={delegateEmail}
                    isHovered={isHovered}
                    isSelected={active}
                    containerStyle={[styles.sidebarStatusAvatarWithEmojiContainer, avatarOffsetStyle]}
                />
            );
        }

        if (emojiStatus) {
            return (
                <AvatarWithOptionalStatus
                    emojiStatus={emojiStatus}
                    isSelected={active}
                    containerStyle={[styles.sidebarStatusAvatarWithEmojiContainer, avatarOffsetStyle]}
                />
            );
        }

        return (
            <ProfileAvatarWithIndicator
                isSelected={active}
                containerStyles={avatarOffsetStyle}
            />
        );
    };
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
                    {renderAvatar(isSelected || (!shouldUseNarrowLayout && hovered), hovered)}
                    {!shouldUseNarrowLayout && (
                        <Text
                            numberOfLines={2}
                            style={[styles.textSmall, styles.textAlignCenter, isSelected ? styles.textBold : styles.textSupporting, styles.mt0Half, styles.navigationTabBarLabel]}
                        >
                            {translate('initialSettingsPage.account')}
                        </Text>
                    )}
                </>
            )}
        </PressableWithFeedback>
    );
}

export default NavigationTabBarAvatar;
