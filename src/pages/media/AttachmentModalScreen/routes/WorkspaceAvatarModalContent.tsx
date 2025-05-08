import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import ONYXKEYS from '@src/ONYXKEYS';
import type AttachmentModalRouteProps from './types';

function WorkspaceAvatarModalContent({navigation, policyID}: AttachmentModalRouteProps) {
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true, canBeMissing: true});

    const contentProps = useMemo(
        () =>
            ({
                source: policy?.avatarURL ? policy?.avatarURL : getDefaultWorkspaceAvatar(policy?.name),
                headerTitle: policy?.name,
                isWorkspaceAvatar: true,
                originalFileName: policy?.originalFileName ?? policy?.id,
                shouldShowNotFoundPage: !Object.keys(policy ?? {}).length && !isLoadingApp,
                isLoading: !Object.keys(policy ?? {}).length && !!isLoadingApp,
                maybeIcon: true,
            } satisfies Partial<AttachmentModalBaseContentProps>),
        [isLoadingApp, policy],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}

export default WorkspaceAvatarModalContent;
