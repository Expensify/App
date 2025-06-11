import React, {useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {openPublicProfilePage} from '@libs/actions/PersonalDetails';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function ProfileAvatarModalContent({navigation, route}: AttachmentModalScreenProps) {
    const {accountID = CONST.DEFAULT_NUMBER_ID} = route.params;

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const personalDetail = personalDetails?.[accountID];
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA, {canBeMissing: false});
    const avatarURL = personalDetail?.avatar ?? '';
    const displayName = getDisplayNameOrDefault(personalDetail);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true, canBeMissing: true});

    useEffect(() => {
        if (!isValidAccountRoute(accountID)) {
            return;
        }
        openPublicProfilePage(accountID);
    }, [accountID]);

    const contentProps = useMemo(
        () =>
            ({
                source: getFullSizeAvatar(avatarURL, accountID),
                isLoading: !!(personalDetailsMetadata?.[accountID]?.isLoading ?? (isLoadingApp && !Object.keys(personalDetail ?? {}).length)),
                headerTitle: formatPhoneNumber(displayName),
                originalFileName: personalDetail?.originalFileName ?? '',
                shouldShowNotFoundPage: !avatarURL,
                maybeIcon: true,
            }) satisfies Partial<AttachmentModalBaseContentProps>,
        [accountID, avatarURL, displayName, isLoadingApp, personalDetail, personalDetailsMetadata],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}
ProfileAvatarModalContent.displayName = 'ProfileAvatarModalContent';

export default ProfileAvatarModalContent;
