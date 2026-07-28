import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {UpperCaseCharacters} from 'type-fest/source/internal';

import React from 'react';

import type {AvatarCommonProps} from './types';

import Avatar from '.';
import AvatarNavigationPressable from './profile/AvatarNavigationPressable';

type PressableAvatarFromIconProps = Omit<AvatarCommonProps, 'source' | 'fill'> & {
    /** Resolved avatar icon. Its `type` selects the user or workspace rendering path, and it also provides the source, ID, name, fill and fallback icon. */
    icon: Icon | undefined;

    /** Report ID used to open the report avatar page for workspace avatars */
    reportID?: string;
};

/** Renders a pressable user or workspace avatar from an `Icon`, opening the matching avatar page when pressed. */
function PressableAvatarFromIcon({icon, reportID, ...styleProps}: PressableAvatarFromIconProps) {
    const {translate} = useLocalize();
    const avatarID = icon?.id ?? CONST.DEFAULT_NUMBER_ID;

    if (icon?.type === CONST.ICON_TYPE_WORKSPACE) {
        const name = icon.name ?? '';

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
                <Avatar
                    {...styleProps}
                    type={CONST.ICON_TYPE_WORKSPACE}
                    source={icon.source}
                    name={name}
                    avatarID={avatarID}
                />
            </AvatarNavigationPressable>
        );
    }

    const accountID = Number(avatarID);

    const openProfileAvatar = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE_AVATAR.getRoute(accountID)));
    };

    return (
        <AvatarNavigationPressable
            onPress={openProfileAvatar}
            accessibilityLabel={translate('common.profile')}
        >
            <Avatar
                {...styleProps}
                type={CONST.ICON_TYPE_AVATAR}
                source={icon?.source}
                avatarID={avatarID}
                fallbackIcon={icon?.fallbackIcon}
                fill={icon?.fill}
            />
        </AvatarNavigationPressable>
    );
}

export default PressableAvatarFromIcon;
