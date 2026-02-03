import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
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
};

function NavigationTabBarAvatar({onPress, isSelected = false, style}: NavigationTabBarAvatarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});

    const delegateEmail = account?.delegatedAccess?.delegate ?? '';
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const emojiStatus = currentUserPersonalDetails?.status?.emojiCode ?? '';

    /**
     * Renders the appropriate avatar component based on user state (delegate, emoji status, or default profile)
     * with the correct active (ring) state for selection and hover effects.
     */
    const renderAvatar = (active: boolean) => {
        if (delegateEmail) {
            return (
                <AvatarWithDelegateAvatar
                    delegateEmail={delegateEmail}
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
                containerStyles={styles.tn0Half}
            />
        );
    };

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={`${translate('initialSettingsPage.account')}, ${translate('sidebarScreen.buttonMySettings')}`}
            wrapperStyle={styles.flex1}
            style={({hovered}) => [style, hovered && styles.navigationTabBarItemHovered]}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
        >
            {({hovered}) => (
                <>
                    {renderAvatar(isSelected || hovered)}
                    <Text style={[styles.textSmall, styles.textAlignCenter, isSelected ? styles.textBold : styles.textSupporting, styles.mt0Half, styles.navigationTabBarLabel]}>
                        {translate('initialSettingsPage.account')}
                    </Text>
                </>
            )}
        </PressableWithFeedback>
    );
}

export default NavigationTabBarAvatar;
