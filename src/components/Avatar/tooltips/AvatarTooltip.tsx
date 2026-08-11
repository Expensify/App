import type {AvatarIcon} from '@components/Avatar/types';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import {useAreAvatarTooltipsEnabled} from './AvatarTooltipContext';

type AvatarTooltipProps = PropsWithChildren<{
    /** Avatar the tooltip describes. When `copilot` is set the tooltip reads "<copilot> (as copilot for <actedFor>)" */
    avatar: AvatarIcon | undefined;

    /** Display name shown when the account has no personal details yet. Falls back to `avatar.name` */
    fallbackDisplayName?: string;

    /** Style for the wrapper View */
    style?: StyleProp<ViewStyle>;
}>;

/** `AvatarTooltip` wraps an avatar in the user-details tooltip describing the account it belongs to.
 * The wrapper `View` is mandatory: `primitives/AvatarContainer` sets `pointerEventsNone`, so the tooltip needs its own hover target.
 * Render the avatar inside `AvatarTooltipsProvider` with `isEnabled={false}` to suppress the tooltip where it would be redundant or misleading.
 */
function AvatarTooltip({avatar, fallbackDisplayName, style, children}: AvatarTooltipProps) {
    const areTooltipsEnabled = useAreAvatarTooltipsEnabled();

    if (!areTooltipsEnabled) {
        return <View style={style}>{children}</View>;
    }

    return (
        <UserDetailsTooltip
            accountID={avatar?.copilot?.actedForAccountID ?? Number(avatar?.id ?? CONST.DEFAULT_NUMBER_ID)}
            delegateAccountID={avatar?.copilot?.accountID}
            icon={avatar}
            fallbackUserDetails={{
                // Nullish coalescing thinks that empty strings are truthy, thus I'm using OR operator
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                displayName: fallbackDisplayName || avatar?.name,
            }}
        >
            <View style={style}>{children}</View>
        </UserDetailsTooltip>
    );
}

export default AvatarTooltip;
