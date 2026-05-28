import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSmallSizeAvatar} from '@libs/UserAvatarUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import AvatarSkeleton from './AvatarSkeleton';
import Indicator from './Indicator';
import Tooltip from './Tooltip';

type AvatarWithIndicatorProps = {
    /** URL for the avatar */
    source?: AvatarSource;

    /** Account id if it's user avatar */
    accountID?: number;

    /** To show a tooltip on hover */
    tooltipText?: string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;

    /** Indicates whether the avatar is loaded or not  */
    isLoading?: boolean;

    /** Avatar size (defaults to SMALL = 28). */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;
};

function AvatarWithIndicator({source, accountID, tooltipText = '', fallbackIcon, isLoading = true, size = CONST.AVATAR_SIZE.SMALL}: AvatarWithIndicatorProps) {
    const defaultAvatars = useDefaultAvatars();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const avatarPixelSize = StyleUtils.getAvatarSize(size);
    const wrapperStyle = size === CONST.AVATAR_SIZE.SMALL ? styles.sidebarAvatar : {height: avatarPixelSize, width: avatarPixelSize, borderRadius: avatarPixelSize};

    return (
        <Tooltip text={tooltipText}>
            <View style={[wrapperStyle]}>
                {isLoading ? (
                    <AvatarSkeleton reasonAttributes={{context: 'AvatarWithIndicator', isLoading}} />
                ) : (
                    <>
                        <Avatar
                            size={size}
                            source={getSmallSizeAvatar({avatarSource: source, accountID, defaultAvatars})}
                            fallbackIcon={fallbackIcon ?? defaultAvatars.FallbackAvatar}
                            avatarID={accountID}
                            type={CONST.ICON_TYPE_AVATAR}
                        />
                        <Indicator />
                    </>
                )}
            </View>
        </Tooltip>
    );
}

export default AvatarWithIndicator;
