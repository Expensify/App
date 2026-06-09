import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
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
import AvatarWithDelegateAvatar from './AvatarWithDelegateAvatar';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type NavigationTabBarAvatarProps = {
    /** Whether the avatar is selected */
    isSelected?: boolean;

    /** Function to call when the avatar is pressed */
    onPress: () => void;

    /** Additional styles to add to the button */
    style?: StyleProp<ViewStyle>;

    /** Whether to render the "Account" label below the avatar. */
    shouldShowLabel?: boolean;

    /** Override for the outer pressable wrapper style. Defaults to flex:1 for the LHN tab cell. */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Whether to apply the LHN tab-cell hover background on hover. */
    shouldShowHoverBackground?: boolean;

    /** Avatar size (defaults to SMALL = 28). */
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
};

function NavigationTabBarAvatar({
    onPress,
    isSelected = false,
    style,
    shouldShowLabel = true,
    wrapperStyle,
    shouldShowHoverBackground = true,
    avatarSize = CONST.AVATAR_SIZE.SMALL,
}: NavigationTabBarAvatarProps) {
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
    const renderAvatar = (active: boolean, isHovered: boolean) => {
        if (delegateEmail) {
            return (
                <AvatarWithDelegateAvatar
                    delegateEmail={delegateEmail}
                    isHovered={isHovered}
                    isSelected={active}
                    containerStyle={styles.sidebarStatusAvatarWithEmojiContainer}
                />
            );
        }

        if (emojiStatus) {
            return (
                <AvatarWithOptionalStatus
                    emojiStatus={emojiStatus}
                    isSelected={active}
                    containerStyle={styles.sidebarStatusAvatarWithEmojiContainer}
                />
            );
        }

        return (
            <ProfileAvatarWithIndicator
                isSelected={active}
                containerStyles={shouldShowLabel ? styles.tn0Half : undefined}
                size={avatarSize}
            />
        );
    };
    const accountAccessibilityState = useMemo(() => ({selected: isSelected}), [isSelected]);

    return (
        <PressableWithFeedback
            onPress={onPress}
            accessibilityLabel={`${translate('initialSettingsPage.account')}, ${translate('sidebarScreen.buttonMySettings')}. ${status ? `${translate('common.yourReviewIsRequired')}.` : ''}`}
            role={CONST.ROLE.TAB}
            wrapperStyle={wrapperStyle ?? styles.flex1}
            accessibilityState={accountAccessibilityState}
            aria-selected={accountAccessibilityState.selected}
            style={({hovered}) => [style, shouldShowHoverBackground && !shouldUseNarrowLayout && hovered && styles.navigationTabBarItemHovered]}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
        >
            {({hovered}) => (
                <>
                    {renderAvatar(isSelected || (!shouldUseNarrowLayout && hovered), hovered)}
                    {shouldShowLabel && (
                        <Text style={[styles.textSmall, styles.textAlignCenter, isSelected ? styles.textBold : styles.textSupporting, styles.mt0Half, styles.navigationTabBarLabel]}>
                            {translate('initialSettingsPage.account')}
                        </Text>
                    )}
                </>
            )}
        </PressableWithFeedback>
    );
}

export default NavigationTabBarAvatar;
