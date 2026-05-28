import React from 'react';
import {View} from 'react-native';
import type {StyleProp} from 'react-native';
import type {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import type {ValueOf} from 'type-fest';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ProfileAvatarWithIndicatorProps = {
    /** Whether the avatar is selected */
    isSelected?: boolean;

    /** Avatar Container styles */
    containerStyles?: StyleProp<ViewStyle>;

    /** Size of the avatar (defaults to SMALL = 28) */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;
};

function ProfileAvatarWithIndicator({isSelected = false, containerStyles, size = CONST.AVATAR_SIZE.SMALL}: ProfileAvatarWithIndicatorProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [isLoading = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const avatarPixelSize = StyleUtils.getAvatarSize(size);
    const ringStyle =
        size === CONST.AVATAR_SIZE.SMALL
            ? styles.selectedAvatarBorder
            : {
                  padding: 1,
                  borderWidth: 2,
                  borderRadius: (avatarPixelSize + 6) / 2,
                  height: avatarPixelSize + 6,
                  width: avatarPixelSize + 6,
                  borderColor: styles.selectedAvatarBorder.borderColor,
                  right: -3,
                  top: -3,
              };

    return (
        <OfflineWithFeedback
            pendingAction={currentUserPersonalDetails.pendingFields?.avatar}
            style={containerStyles}
        >
            <View style={[styles.pRelative]}>
                <View
                    style={[isSelected && ringStyle, styles.pAbsolute]}
                    testID="avatar-ring"
                />
                <AvatarWithIndicator
                    source={currentUserPersonalDetails.avatar}
                    accountID={currentUserPersonalDetails.accountID}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    isLoading={!!(isLoading && !currentUserPersonalDetails.avatar)}
                    size={size}
                />
            </View>
        </OfflineWithFeedback>
    );
}

export default ProfileAvatarWithIndicator;
