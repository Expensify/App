import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type AvatarWithDelegateAvatarProps = {
    /** Original account of delegate */
    delegateEmail: string;

    /** Whether the avatar is selected */
    isSelected?: boolean;
};

function AvatarWithDelegateAvatar({delegateEmail, isSelected = false}: AvatarWithDelegateAvatarProps) {
    const styles = useThemeStyles();
    const personalDetails = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const delegatePersonalDetail = Object.values(personalDetails[0] ?? {}).find((personalDetail) => personalDetail?.login?.toLowerCase() === delegateEmail);

    return (
        <View style={styles.sidebarStatusAvatarContainer}>
            <ProfileAvatarWithIndicator isSelected={isSelected} />
            <View style={[styles.sidebarStatusAvatar]}>
                <View style={styles.emojiStatusLHN}>
                    <Avatar
                        size={CONST.AVATAR_SIZE.SMALL}
                        source={UserUtils.getSmallSizeAvatar(delegatePersonalDetail?.avatar, delegatePersonalDetail?.accountID)}
                        fallbackIcon={delegatePersonalDetail?.fallbackIcon}
                        type={CONST.ICON_TYPE_AVATAR}
                    />
                </View>
            </View>
        </View>
    );
}

AvatarWithDelegateAvatar.displayName = 'AvatarWithDelegateAvatar';

export default AvatarWithDelegateAvatar;
