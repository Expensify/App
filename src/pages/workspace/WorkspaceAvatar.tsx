import React from 'react';
import AttachmentModal from '@components/AttachmentModal';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceAvatarProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.WORKSPACE_AVATAR>;

function WorkspaceAvatar({route}: WorkspaceAvatarProps) {
    const policy = usePolicy(route?.params?.policyID);
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const avatarURL = (policy?.avatarURL ?? '') ? (policy?.avatarURL ?? '') : ReportUtils.getDefaultWorkspaceAvatar(policy?.name ?? '');

    return (
        <AttachmentModal
            headerTitle={policy?.name ?? ''}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, 0)}
            onModalClose={Navigation.goBack}
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
