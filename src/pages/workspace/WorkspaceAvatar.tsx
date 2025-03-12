import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

type WorkspaceAvatarOnyxProps = {
    policy: OnyxEntry<Policy>;
    isLoadingApp: OnyxEntry<boolean>;
};

type WorkspaceAvatarProps = WorkspaceAvatarOnyxProps & PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.WORKSPACE_AVATAR>;

function WorkspaceAvatar({policy, isLoadingApp = true}: WorkspaceAvatarProps) {
    const avatarURL = policy?.avatarURL ?? '' ? policy?.avatarURL ?? '' : ReportUtils.getDefaultWorkspaceAvatar(policy?.name ?? '');

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

export default withOnyx<WorkspaceAvatarProps, WorkspaceAvatarOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID ?? '-1'}`,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(WorkspaceAvatar);
