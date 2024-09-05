import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceAvatarOnyxProps = {
    policy: OnyxEntry<Policy>;
    isLoadingApp: OnyxEntry<boolean>;
};

type WorkspaceAvatarProps = WorkspaceAvatarOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.WORKSPACE_AVATAR>;

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

export default function ComponentWithOnyx(props: Omit<WorkspaceAvatarProps, keyof WorkspaceAvatarOnyxProps>) {
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${props.route.params.policyID ?? '-1'}`);
    const [isLoadingApp, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    if (isLoadingOnyxValue(policyMetadata, isLoadingAppMetadata)) {
        return null;
    }

    return (
        <WorkspaceAvatar
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            policy={policy}
            isLoadingApp={isLoadingApp}
        />
    );
}
