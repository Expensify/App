import type {WorkspaceAvatarProps} from '@components/Avatar/WorkspaceAvatar';
import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';

import useLocalize from '@hooks/useLocalize';

import Navigation from '@navigation/Navigation';

import ROUTES from '@src/ROUTES';

import type {UpperCaseCharacters} from 'type-fest/source/internal';

import React from 'react';

import AvatarNavigationPressable from './AvatarNavigationPressable';

type PressableWorkspaceAvatarProps = WorkspaceAvatarProps & {
    /** Whether pressing the avatar opens the workspace avatar page */
    shouldUseProfileNavigationWrapper?: boolean;

    /** When provided, pressing the avatar opens the report avatar page instead of the workspace avatar page */
    reportID?: string;
};

/** Renders a workspace avatar that opens the workspace (or report) avatar page when pressed. */
function PressableWorkspaceAvatar({shouldUseProfileNavigationWrapper, reportID, name, avatarID, ...workspaceAvatarProps}: PressableWorkspaceAvatarProps) {
    const {translate} = useLocalize();

    const avatar = (
        <WorkspaceAvatar
            {...workspaceAvatarProps}
            name={name}
            avatarID={avatarID}
        />
    );

    if (!shouldUseProfileNavigationWrapper) {
        return avatar;
    }

    const openWorkspaceAvatar = () => {
        if (reportID) {
            Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(reportID, String(avatarID)));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const firstLetter = (name.at(0) ?? 'A').toUpperCase() as UpperCaseCharacters;
        Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(String(avatarID), firstLetter));
    };

    return (
        <AvatarNavigationPressable
            onPress={openWorkspaceAvatar}
            accessibilityLabel={translate('common.workspaces')}
        >
            {avatar}
        </AvatarNavigationPressable>
    );
}

export default PressableWorkspaceAvatar;
