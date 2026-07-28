import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import useStyleUtils from '@hooks/useStyleUtils';

import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {BaseAvatarProps} from './types';

type SingleAvatarProps = BaseAvatarProps & {
    /** The resolved avatar icon to render */
    avatar: IconType | undefined;

    /** Container styles for the avatar */
    containerStyles?: StyleProp<ViewStyle>;

    /** Account ID the tooltip describes. Tooltip-only: it can differ from `avatar.id`, e.g. the LHN passes the delegate's account ID */
    accountID: number;

    /** Delegate account ID used for the tooltip */
    delegateAccountID?: number;

    /** Whether the avatar is displayed within a report action */
    isInReportAction?: boolean;
};

/** `SingleAvatar` renders one avatar wrapped in a `UserDetailsTooltip`, used when there is a single actor to display. */
function SingleAvatar({
    avatar,
    size,
    containerStyles,
    shouldShowTooltip,
    delegateAccountID,
    accountID,
    isInReportAction,
    shouldUseProfileNavigationWrapper,
    fallbackDisplayName,
    reportID,
}: SingleAvatarProps) {
    const StyleUtils = useStyleUtils();
    const avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);

    return (
        <UserDetailsTooltip
            accountID={accountID}
            delegateAccountID={delegateAccountID}
            icon={avatar}
            fallbackUserDetails={{
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                displayName: fallbackDisplayName || avatar?.name,
            }}
            shouldRender={shouldShowTooltip}
        >
            <View>
                <AvatarFromIcon
                    shouldUseProfileNavigationWrapper={shouldUseProfileNavigationWrapper}
                    containerStyles={containerStyles ?? avatarContainerStyles}
                    icon={avatar}
                    size={size}
                    testID="ReportActionAvatars-SingleAvatar"
                    reportID={reportID}
                />
            </View>
        </UserDetailsTooltip>
    );
}

export default SingleAvatar;
