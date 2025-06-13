import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import ONYXKEYS from '@src/ONYXKEYS';

function WorkspaceAvatarModalContent({navigation, route}: AttachmentModalScreenProps) {
    const {policyID} = route.params;

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true, canBeMissing: true});

    const avatarURL = policy?.avatarURL ?? '' ?? getDefaultWorkspaceAvatar(policy?.name ?? '');

    const contentProps = useMemo(
        () =>
            ({
                source: getFullSizeAvatar(avatarURL, 0),
                headerTitle: policy?.name,
                isWorkspaceAvatar: true,
                originalFileName: policy?.originalFileName ?? policy?.id,
                shouldShowNotFoundPage: !Object.keys(policy ?? {}).length && !isLoadingApp,
                isLoading: !Object.keys(policy ?? {}).length && !!isLoadingApp,
                maybeIcon: true,
            }) satisfies Partial<AttachmentModalBaseContentProps>,
        [avatarURL, isLoadingApp, policy],
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
