import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type AttachmentModalRouteProps from './types';

function WorkspaceAvatarModalContent({params, navigation, attachmentId}: AttachmentModalRouteProps) {
    const policyID = params.policyID ?? CONST.DEFAULT_NUMBER_ID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});

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
            attachmentId={attachmentId}
            contentProps={contentProps}
        />
    );
}

export default WorkspaceAvatarModalContent;
