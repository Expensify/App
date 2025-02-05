import {useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {openPublicProfilePage} from '@libs/actions/PersonalDetails';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AttachmentModalContentProps} from './AttachmentModalContent';
import type {AttachmentModalType} from './types';

// type ReportAttachment = {
//     attachmentType: typeof CONST.ATTACHMENT_MODAL_TYPE.REPORT_ATTACHMENT;
// };

// type ProfileAvatar = {
//     attachmentType: typeof CONST.ATTACHMENT_MODAL_TYPE.PROFILE_AVATAR;

// };

type UseAttachmentParams = {
    attachmentModalType: AttachmentModalType;
    accountID?: string | number;
    policyID?: string | number;
    reportID?: string;
};

function useAttachment({attachmentModalType, ...params}: UseAttachmentParams): Partial<AttachmentModalContentProps> {
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${params.policyID ?? '-1'}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});

    const accountID = Number(params.accountID ?? '-1');

    useEffect(() => {
        if (attachmentModalType !== CONST.ATTACHMENT_MODAL_TYPE.PROFILE_AVATAR) {
            return;
        }

        if (!isValidAccountRoute(accountID)) {
            return;
        }
        openPublicProfilePage(accountID);
    }, [accountID, attachmentModalType]);

    return useMemo(() => {
        if (attachmentModalType === CONST.ATTACHMENT_MODAL_TYPE.PROFILE_AVATAR) {
            const personalDetail = personalDetails?.[accountID];
            const avatarURL = personalDetail?.avatar ?? '';

            const isLoading = !!(personalDetailsMetadata?.[accountID]?.isLoading ?? (isLoadingApp && !Object.keys(personalDetail ?? {}).length));
            const displayName = getDisplayNameOrDefault(personalDetail);
            const originalFileName = personalDetail?.originalFileName ?? '';
            // eslint-disable-next-line rulesdir/no-negated-variables
            const shouldShowNotFoundPage = !avatarURL;
            const source = getFullSizeAvatar(avatarURL, accountID);
            const headerTitle = formatPhoneNumber(displayName);

            return {
                source,
                isLoading,
                headerTitle,
                originalFileName,
                shouldShowNotFoundPage,
            };
        }

        if (attachmentModalType === CONST.ATTACHMENT_MODAL_TYPE.WORKSPACE_AVATAR) {
            const source = policy?.avatarURL ?? '' ? policy?.avatarURL ?? '' : getDefaultWorkspaceAvatar(policy?.name ?? '');
            const headerTitle = policy?.name ?? '';
            const originalFileName = policy?.originalFileName ?? policy?.id;
            // eslint-disable-next-line rulesdir/no-negated-variables
            const shouldShowNotFoundPage = !Object.keys(policy ?? {}).length && !isLoadingApp;
            const isLoading = !Object.keys(policy ?? {}).length && !!isLoadingApp;

            return {
                source,
                headerTitle,
                isWorkspaceAvatar: true,
                originalFileName,
                shouldShowNotFoundPage,
                isLoading,
                maybeIcon: true,
            };
        }

        return {};
    }, [accountID, attachmentModalType, isLoadingApp, personalDetails, personalDetailsMetadata, policy]);
}

export default useAttachment;
