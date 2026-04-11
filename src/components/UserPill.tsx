import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';

type UserPillProps = {
    /** Avatar source (URL or icon) */
    avatar?: AvatarSource;

    /** Display name of the user */
    displayName: string;

    /** Account ID for proper avatar rendering */
    accountID?: number;

    /** Email/login for tooltip subtitle */
    email?: string;
};

function UserPill({avatar, displayName, accountID, email}: UserPillProps) {
    const styles = useThemeStyles();

    return (
        <UserDetailsTooltip
            accountID={accountID ?? CONST.DEFAULT_NUMBER_ID}
            fallbackUserDetails={{
                avatar,
                displayName: Str.removeSMSDomain(displayName),
                login: email ?? displayName,
            }}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.alignSelfStart, styles.userPill]}>
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
        </UserDetailsTooltip>
    );
}

UserPill.displayName = 'UserPill';

export default UserPill;
export type {UserPillProps};
