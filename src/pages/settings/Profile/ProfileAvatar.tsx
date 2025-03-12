import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import {openPublicProfilePage} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type ProfileAvatarProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.PROFILE_AVATAR>;

function ProfileAvatar({route}: ProfileAvatarProps) {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});
    const personalDetail = personalDetails?.[route.params.accountID];
    const avatarURL = personalDetail?.avatar ?? '';
    const accountID = Number(route.params.accountID ?? CONST.DEFAULT_NUMBER_ID);
    const isLoading = personalDetailsMetadata?.[accountID]?.isLoading ?? (isLoadingApp && !Object.keys(personalDetail ?? {}).length);
    const displayName = getDisplayNameOrDefault(personalDetail);

    useEffect(() => {
        if (!isValidAccountRoute(Number(accountID)) ?? !!avatarURL) {
            return;
        }
        openPublicProfilePage(accountID);
    }, [accountID, avatarURL]);

    return (
        <AttachmentModal
            headerTitle={formatPhoneNumber(displayName)}
            defaultOpen
            source={getFullSizeAvatar(avatarURL, accountID)}
            onModalClose={() => {
                Navigation.goBack();
            }}
            originalFileName={personalDetail?.originalFileName ?? ''}
            isLoading={!!isLoading}
            shouldShowNotFoundPage={!avatarURL}
            maybeIcon
        />
    );
}

ProfileAvatar.displayName = 'ProfileAvatar';

export default ProfileAvatar;
