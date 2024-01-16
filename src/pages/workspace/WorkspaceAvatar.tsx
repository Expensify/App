import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

type PolicyRoute = RouteProp<{params: {policyID: string}}>;

type WorkspaceAvatarOnyxProps = {
    policy: OnyxEntry<Policy>;
    isLoadingApp: OnyxEntry<boolean>;
};

type WorkspaceAvatarProps = WorkspaceAvatarOnyxProps & {
    route: PolicyRoute;
};

function getPolicyIDFromRoute(route: PolicyRoute) {
    return route.params.policyID ?? '';
}

function WorkspaceAvatar({route, policy, isLoadingApp = true}: WorkspaceAvatarProps) {
    const avatarURL = policy?.avatar ?? '' ? policy?.avatar ?? '' : ReportUtils.getDefaultWorkspaceAvatar(policy?.name ?? '');
    return (
        <AttachmentModal
            headerTitle={policy?.name ?? ''}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, 0)}
            onModalClose={() => {
                Navigation.goBack(ROUTES.WORKSPACE_SETTINGS.getRoute(getPolicyIDFromRoute(route)));
            }}
            isWorkspaceAvatar
            originalFileName={policy?.originalFileName ?? policy?.name ?? ''}
            shouldShowNotFoundPage={!Object.keys(policy ?? {}).length && !isLoadingApp}
            isLoading={!Object.keys(policy ?? {}).length && isLoadingApp}
        />
    );
}

WorkspaceAvatar.displayName = 'WorkspaceAvatar';

export default withOnyx<WorkspaceAvatarProps, WorkspaceAvatarOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDFromRoute(route)}`,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(WorkspaceAvatar);
