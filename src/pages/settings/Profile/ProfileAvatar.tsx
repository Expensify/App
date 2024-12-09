import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type ProfileAvatarProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.PROFILE_AVATAR>;

function ProfileAvatar({route}: ProfileAvatarProps) {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA);
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const personalDetail = personalDetails?.[route.params.accountID];
    const avatarURL = personalDetail?.avatar ?? '';
    const accountID = Number(route.params.accountID ?? '-1');
    const isLoading = personalDetailsMetadata?.[accountID]?.isLoading ?? (isLoadingApp && !Object.keys(personalDetail ?? {}).length);
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail);

    useEffect(() => {
        if (!ValidationUtils.isValidAccountRoute(Number(accountID)) || !!avatarURL) {
            return;
        }
        PersonalDetails.openPublicProfilePage(accountID);
    }, [accountID, avatarURL]);

    return (
        <AttachmentModal
            defaultOpen
            headerTitle={displayName}
            source={UserUtils.getFullSizeAvatar(avatarURL, accountID)}
            onModalClose={() => {
                setTimeout(() => {
                    Navigation.goBack();
                }, CONST.ANIMATED_TRANSITION);
            }}
            originalFileName={personalDetail?.originalFileName ?? ''}
            isLoading={!!isLoading}
            shouldShowNotFoundPage={!avatarURL}
        />
    );
}

ProfileAvatar.displayName = 'ProfileAvatar';

export default ProfileAvatar;
