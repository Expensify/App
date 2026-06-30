import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import ProfileAvatar from './ProfileAvatar';
import type {BaseAvatarProps} from './types';

type SingleAvatarProps = BaseAvatarProps & {
    /** The resolved avatar icon to render */
    avatar: IconType | undefined;

    /** Container styles for the avatar */
    containerStyles?: StyleProp<ViewStyle>;

    /** Account ID used for the tooltip */
    accountID: number;

    /** Delegate account ID used for the tooltip */
    delegateAccountID?: number;

    /** Icon shown when the avatar source fails to load */
    fallbackIcon?: AvatarSource;

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
    fallbackIcon,
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
                <ProfileAvatar
                    shouldUseProfileNavigationWrapper={shouldUseProfileNavigationWrapper}
                    containerStyles={containerStyles ?? avatarContainerStyles}
                    source={avatar?.source}
                    type={avatar?.type ?? CONST.ICON_TYPE_AVATAR}
                    name={avatar?.name}
                    avatarID={avatar?.id}
                    size={size}
                    fill={avatar?.fill}
                    fallbackIcon={fallbackIcon}
                    testID="ReportActionAvatars-SingleAvatar"
                    reportID={reportID}
                />
            </View>
        </UserDetailsTooltip>
    );
}

export default SingleAvatar;
