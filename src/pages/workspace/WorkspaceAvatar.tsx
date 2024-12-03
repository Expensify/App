import React from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import attachmentModalHandler from '@libs/AttachmentModalHandler';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceAvatarProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.WORKSPACE_AVATAR>;

function WorkspaceAvatar({route}: WorkspaceAvatarProps) {
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID ?? '-1'}`);
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const avatarURL = policy?.avatarURL ?? '' ? policy?.avatarURL ?? '' : ReportUtils.getDefaultWorkspaceAvatar(policy?.name ?? '');
    const onModalClose = () => {
        Navigation.goBack();
    };

    return (
        <AttachmentModal
            headerTitle={policy?.name ?? ''}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, 0)}
            onModalClose={() => attachmentModalHandler.handleModalClose(onModalClose)}
            isWorkspaceAvatar
            originalFileName={policy?.originalFileName ?? policy?.id}
            shouldShowNotFoundPage={!Object.keys(policy ?? {}).length && !isLoadingApp}
            isLoading={!Object.keys(policy ?? {}).length && !!isLoadingApp}
            maybeIcon
        />
    );
}

WorkspaceAvatar.displayName = 'WorkspaceAvatar';

export default WorkspaceAvatar;
