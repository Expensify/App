import React from 'react';
import {View} from 'react-native';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
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
};

function AvatarWithIndicator({source, accountID, tooltipText = '', fallbackIcon, isLoading = true}: AvatarWithIndicatorProps) {
    const defaultAvatars = useDefaultAvatars();
    const styles = useThemeStyles();

    return (
        <Tooltip text={tooltipText}>
            <View style={[styles.sidebarAvatar]}>
                {isLoading ? (
                    <AvatarSkeleton />
                ) : (
                    <>
                        <Avatar
                            size={CONST.AVATAR_SIZE.SMALL}
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
