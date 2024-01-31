import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as UserUtils from '@libs/UserUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

type ProfileAvatarOnyxProps = {
    personalDetails: OnyxEntry<PersonalDetailsList>;
    isLoadingApp: OnyxEntry<boolean>;
};

type ProfileAvatarProps = ProfileAvatarOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.PROFILE_AVATAR>;

function ProfileAvatar({route, personalDetails, isLoadingApp = true}: ProfileAvatarProps) {
    const personalDetail = personalDetails?.[route.params.accountID];
    const avatarURL = personalDetail?.avatar ?? '';
    const accountID = Number(route.params.accountID ?? '');
    const isLoading = personalDetail?.isLoading ?? (isLoadingApp && !Object.keys(personalDetail ?? {}).length);

    useEffect(() => {
        if (!ValidationUtils.isValidAccountRoute(Number(accountID)) ?? !!avatarURL) {
            return;
        }
        PersonalDetails.openPublicProfilePage(accountID);
    }, [accountID, avatarURL]);

    return (
        <AttachmentModal
            // @ts-expect-error TODO: Remove this once AttachmentModal (https://github.com/Expensify/App/issues/25130) is migrated to TypeScript.
            headerTitle={personalDetail?.displayName ?? ''}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, accountID)}
            onModalClose={() => {
                Navigation.goBack();
            }}
            originalFileName={personalDetail?.originalFileName ?? ''}
            isLoading={isLoading}
            shouldShowNotFoundPage={!avatarURL}
        />
    );
}

ProfileAvatar.displayName = 'ProfileAvatar';

export default withOnyx<ProfileAvatarProps, ProfileAvatarOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(ProfileAvatar);
