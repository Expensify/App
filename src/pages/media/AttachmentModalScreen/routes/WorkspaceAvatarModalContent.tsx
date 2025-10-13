import React, {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import useDownloadAttachment from './hooks/useDownloadAttachment';

function WorkspaceAvatarModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.WORKSPACE_AVATAR>) {
    const {policyID, letter: fallbackLetter} = route.params;

    const policy = usePolicy(policyID);
    const [isLoadingApp = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true, initWithStoredValues: false});

    const avatarURL = policy?.avatarURL ?? getDefaultWorkspaceAvatar(policy?.name ?? fallbackLetter);

    const policyKeysLength = Object.keys(policy ?? {}).length;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = policyKeysLength === 0 && !isLoadingApp && (!policyID || !fallbackLetter);

    const onDownloadAttachment = useDownloadAttachment();

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source: getFullSizeAvatar(avatarURL, 0),
            headerTitle: policy?.name ?? '',
            originalFileName: policy?.originalFileName ?? policy?.id ?? policyID,
            shouldShowNotFoundPage,
            isWorkspaceAvatar: true,
            isLoading: policyKeysLength === 0 && !!isLoadingApp,
            maybeIcon: true,
            onDownloadAttachment,
        }),
        [avatarURL, isLoadingApp, onDownloadAttachment, policy?.id, policy?.name, policy?.originalFileName, policyID, policyKeysLength, shouldShowNotFoundPage],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}
WorkspaceAvatarModalContent.displayName = 'WorkspaceAvatarModalContent';

export default WorkspaceAvatarModalContent;
