import type {UserAvatarProps} from '@components/Avatar/UserAvatar';
import UserAvatar from '@components/Avatar/UserAvatar';

import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import Navigation from '@navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

import AvatarNavigationPressable from './AvatarNavigationPressable';

type PressableUserAvatarProps = UserAvatarProps & {
    /** Whether pressing the avatar opens the account's profile avatar page */
    shouldUseProfileNavigationWrapper?: boolean;
};

/** Renders a user avatar that opens the account's profile avatar page when pressed. */
function PressableUserAvatar({shouldUseProfileNavigationWrapper, accountID, ...userAvatarProps}: PressableUserAvatarProps) {
    const {translate} = useLocalize();

    const avatar = (
        <UserAvatar
            {...userAvatarProps}
            accountID={accountID}
        />
    );

    if (!shouldUseProfileNavigationWrapper) {
        return avatar;
    }

    const openProfileAvatar = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE_AVATAR.getRoute(accountID)));
    };

    return (
        <AvatarNavigationPressable
            onPress={openProfileAvatar}
            accessibilityLabel={translate('common.profile')}
        >
            {avatar}
        </AvatarNavigationPressable>
    );
}

export default PressableUserAvatar;
