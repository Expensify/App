import React, {useEffect, useMemo} from 'react';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {openPublicProfilePage} from '@libs/actions/PersonalDetails';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getFullSizeAvatar} from '@libs/UserAvatarUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import useDownloadAttachment from './hooks/useDownloadAttachment';

function ProfileAvatarModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.PROFILE_AVATAR>) {
    const {accountID = CONST.DEFAULT_NUMBER_ID, source: tempSource, originalFileName: tempOriginalFileName} = route.params;

    const defaultAvatars = useDefaultAvatars();
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

    // Temp variables are coming as '' therefore || is needed
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const source = tempSource || getFullSizeAvatar({avatarSource: avatarURL, accountID, defaultAvatars});
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const originalFileName = tempOriginalFileName || (personalDetail?.originalFileName ?? '');
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
            shouldCloseOnSwipeDown: true,
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

export default ProfileAvatarModalContent;
