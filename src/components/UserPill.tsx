import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import Text from './Text';

type UserPillProps = {
    /** Avatar source (URL or icon) */
    avatar?: AvatarSource;

    /** Display name of the user */
    displayName: string;

    /** Account ID for proper avatar rendering */
    accountID?: number;
};

function UserPill({avatar, displayName, accountID}: UserPillProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.userPill]}>
            <Avatar
                source={avatar}
                size={CONST.AVATAR_SIZE.MENTION_ICON}
                type={CONST.ICON_TYPE_AVATAR}
                avatarID={accountID}
                name={displayName}
            />
            <Text
                style={styles.userPillText}
                numberOfLines={1}
            >
                {Str.removeSMSDomain(displayName)}
            </Text>
        </View>
    );
}

UserPill.displayName = 'UserPill';

export default UserPill;
export type {UserPillProps};
