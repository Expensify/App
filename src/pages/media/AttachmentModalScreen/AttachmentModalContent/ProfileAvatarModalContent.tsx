import {useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {openPublicProfilePage} from '@libs/actions/PersonalDetails';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AttachmentModalBaseContentProps} from './BaseContent';
import type {AttachmentModalContent} from './types';

const ProfileAvatarModalContent: AttachmentModalContent = ({params, children}) => {
    const accountID = Number(params.accountID ?? '-1');

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const personalDetail = personalDetails?.[accountID];
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA);
    const avatarURL = personalDetail?.avatar ?? '';
    const displayName = getDisplayNameOrDefault(personalDetail);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});

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
            } satisfies Partial<AttachmentModalBaseContentProps>),
        [accountID, avatarURL, displayName, isLoadingApp, personalDetail, personalDetailsMetadata],
    );

    const wrapperProps = useMemo(() => ({}), []);

    // eslint-disable-next-line react-compiler/react-compiler
    return children({contentProps, wrapperProps});
};

export default ProfileAvatarModalContent;
