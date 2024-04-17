import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type ProfileAvatarWithIndicatorProps = {
    /** Whether the avatar is selected */
    isSelected?: boolean;
};

function ProfileAvatarWithIndicator({isSelected = false}: ProfileAvatarWithIndicatorProps) {
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [isLoadingOnyxValue] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const isLoading = isLoadingOnyxValue ?? true;

    return (
        <OfflineWithFeedback pendingAction={currentUserPersonalDetails.pendingFields?.avatar}>
            <View style={[isSelected && styles.selectedAvatarBorder]}>
                <AvatarWithIndicator
                    source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    isLoading={isLoading && !currentUserPersonalDetails.avatar}
                />
            </View>
        </OfflineWithFeedback>
    );
}

ProfileAvatarWithIndicator.displayName = 'ProfileAvatarWithIndicator';

export default ProfileAvatarWithIndicator;
