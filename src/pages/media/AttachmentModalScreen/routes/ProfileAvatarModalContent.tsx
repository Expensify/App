import React, {useEffect, useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {openPublicProfilePage} from '@libs/actions/PersonalDetails';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import useDownloadAttachment from './hooks/useDownloadAttachment';

function ProfileAvatarModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.PROFILE_AVATAR>) {
    const {accountID = CONST.DEFAULT_NUMBER_ID} = route.params;
    const {formatPhoneNumber} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const personalDetail = personalDetails?.[accountID];
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA, {canBeMissing: false});
    const avatarURL = personalDetail?.avatar ?? '';
    const displayName = getDisplayNameOrDefault(personalDetail);
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});

    useEffect(() => {
        if (!isValidAccountRoute(Number(accountID))) {
            return;
        }
        openPublicProfilePage(accountID);
    }, [accountID]);

    const onDownloadAttachment = useDownloadAttachment();

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source: getFullSizeAvatar(avatarURL, accountID),
            originalFileName: personalDetail?.originalFileName ?? '',
            headerTitle: formatPhoneNumber(displayName),
            isLoading: !!(personalDetailsMetadata?.[accountID]?.isLoading ?? (isLoadingApp && !Object.keys(personalDetail ?? {}).length)),
            shouldShowNotFoundPage: !avatarURL,
            maybeIcon: true,
            onDownloadAttachment,
        }),
        [accountID, avatarURL, displayName, formatPhoneNumber, isLoadingApp, onDownloadAttachment, personalDetail, personalDetailsMetadata],
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
