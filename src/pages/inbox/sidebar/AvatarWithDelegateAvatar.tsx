import UserAvatar from '@components/Avatar/UserAvatar';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getSmallSizeAvatar} from '@libs/UserAvatarUtils';

import type {AvatarSizeName} from '@styles/utils/types';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type AvatarWithDelegateAvatarProps = {
    /** Original account of delegate */
    delegateEmail: string;

    isHovered?: boolean;
    isSelected?: boolean;
    size?: AvatarSizeName;
};

function AvatarWithDelegateAvatar({delegateEmail, isHovered = false, isSelected = false, size = CONST.AVATAR_SIZE.SMALL}: AvatarWithDelegateAvatarProps) {
    const defaultAvatars = useDefaultAvatars();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct avatar size
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const personalDetails = usePersonalDetails();
    const delegatePersonalDetail = Object.values(personalDetails ?? {}).find((personalDetail) => personalDetail?.login?.toLowerCase() === delegateEmail);

    return (
        <View style={[styles.sidebarStatusAvatarContainer, StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size))]}>
            <ProfileAvatarWithIndicator
                isSelected={isSelected}
                size={size}
            />
            <View style={[styles.sidebarStatusAvatar, isHovered && styles.sidebarStatusAvatarHovered]}>
                <View style={styles.emojiStatusLHN}>
                    <UserAvatar
                        size={isSmallScreenWidth ? CONST.AVATAR_SIZE.XXX_SMALL : CONST.AVATAR_SIZE.SMALL}
                        source={getSmallSizeAvatar({avatarSource: delegatePersonalDetail?.avatar, accountID: delegatePersonalDetail?.accountID, defaultAvatars})}
                        fallbackIcon={delegatePersonalDetail?.fallbackIcon}
                        accountID={delegatePersonalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                    />
                </View>
            </View>
        </View>
    );
}

export default AvatarWithDelegateAvatar;
