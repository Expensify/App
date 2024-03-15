import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type ProfileAvatarWithIndicatorOnyxProps = {
    /** Indicates whether the app is loading initial data */
    isLoading: OnyxEntry<boolean>;
};

type ProfileAvatarWithIndicatorProps = ProfileAvatarWithIndicatorOnyxProps & {
    /** Whether the avatar is selected */
    isSelected: boolean;
};

function ProfileAvatarWithIndicator({isLoading = true, isSelected = false}: ProfileAvatarWithIndicatorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    return (
        <OfflineWithFeedback pendingAction={currentUserPersonalDetails.pendingFields?.avatar ?? null}>
            <View style={[isSelected && styles.selectedAvatarBorder]}>
                <AvatarWithIndicator
                    source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                    tooltipText={translate('profilePage.profile')}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    isLoading={!!isLoading && !currentUserPersonalDetails.avatar}
                />
            </View>
        </OfflineWithFeedback>
    );
}

ProfileAvatarWithIndicator.displayName = 'PressableAvatarWithIndicator';

export default withOnyx<ProfileAvatarWithIndicatorProps, ProfileAvatarWithIndicatorOnyxProps>({
    isLoading: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(ProfileAvatarWithIndicator);
