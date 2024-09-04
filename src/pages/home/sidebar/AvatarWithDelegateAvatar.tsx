import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type AvatarWithDelegateAvatarProps = {
    /** Emoji status */
    delegateEmail: string;

    /** Whether the avatar is selected */
    isSelected?: boolean;
};

function AvatarWithDelegateAvatar({delegateEmail, isSelected = false}: AvatarWithDelegateAvatarProps) {
    const styles = useThemeStyles();
    const personalDetail = PersonalDetailsUtils.getPersonalDetailByEmail(delegateEmail);

    return (
        <View style={styles.sidebarStatusAvatarContainer}>
            <ProfileAvatarWithIndicator isSelected={isSelected} />
            <View style={[styles.sidebarStatusAvatar]}>
                <View style={styles.emojiStatusLHN}>
                    <Avatar
                        size={CONST.AVATAR_SIZE.SMALL}
                        source={UserUtils.getSmallSizeAvatar(personalDetail?.avatar, personalDetail?.accountID)}
                        fallbackIcon={personalDetail?.fallbackIcon}
                        type={CONST.ICON_TYPE_AVATAR}
                    />
                </View>
            </View>
        </View>
    );
}

AvatarWithDelegateAvatar.displayName = 'AvatarWithDelegateAvatar';

export default AvatarWithDelegateAvatar;
