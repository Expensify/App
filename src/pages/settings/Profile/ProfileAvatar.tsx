import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, PersonalDetailsMetadata} from '@src/types/onyx';

type ProfileAvatarOnyxProps = {
    personalDetails: OnyxEntry<PersonalDetailsList>;
    personalDetailsMetadata: OnyxEntry<Record<string, PersonalDetailsMetadata>>;
    isLoadingApp: OnyxEntry<boolean>;
};

type ProfileAvatarProps = ProfileAvatarOnyxProps & PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.PROFILE_AVATAR>;

function ProfileAvatar({route, personalDetails, personalDetailsMetadata, isLoadingApp = true}: ProfileAvatarProps) {
    const personalDetail = personalDetails?.[route.params.accountID];
    const avatarURL = personalDetail?.avatar ?? '';
    const accountID = Number(route.params.accountID ?? '-1');
    const isLoading = personalDetailsMetadata?.[accountID]?.isLoading ?? (isLoadingApp && !Object.keys(personalDetail ?? {}).length);
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail);

    useEffect(() => {
        if (!ValidationUtils.isValidAccountRoute(Number(accountID)) ?? !!avatarURL) {
            return;
        }
        PersonalDetails.openPublicProfilePage(accountID);
    }, [accountID, avatarURL]);

    return (
        <AttachmentModal
            headerTitle={displayName}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, accountID)}
            onModalClose={() => {
                Navigation.goBack();
            }}
            originalFileName={personalDetail?.originalFileName ?? ''}
            isLoading={!!isLoading}
            shouldShowNotFoundPage={!avatarURL}
        />
    );
}

ProfileAvatar.displayName = 'ProfileAvatar';

export default withOnyx<ProfileAvatarProps, ProfileAvatarOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    personalDetailsMetadata: {
        key: ONYXKEYS.PERSONAL_DETAILS_METADATA,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(ProfileAvatar);
