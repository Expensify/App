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

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const personalDetail = personalDetails?.[accountID];
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA, {canBeMissing: true});
    const avatarURL = personalDetail?.avatar ?? '';
    const displayName = getDisplayNameOrDefault(personalDetail);

    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const isLoading = personalDetailsMetadata?.[accountID]?.isLoading ?? (isLoadingApp && !Object.keys(personalDetail ?? {}).length);

    useEffect(() => {
        if (!isValidAccountRoute(Number(accountID))) {
            return;
        }
        openPublicProfilePage(accountID);
    }, [accountID]);

    const source = getFullSizeAvatar(avatarURL, accountID);
    const originalFileName = personalDetail?.originalFileName ?? '';
    const headerTitle = formatPhoneNumber(displayName);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !avatarURL;

    const onDownloadAttachment = useDownloadAttachment();

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source,
            originalFileName,
            headerTitle,
            isLoading,
            shouldShowNotFoundPage,
            maybeIcon: true,
            onDownloadAttachment,
        }),
        [headerTitle, isLoading, onDownloadAttachment, originalFileName, shouldShowNotFoundPage, source],
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
