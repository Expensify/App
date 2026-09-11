import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import UserAvatar from './Avatar/UserAvatar';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';

type UserPillProps = {
    avatar?: AvatarSource;
    displayName: string;
    accountID?: number;
    email?: string;
    style?: StyleProp<ViewStyle>;
};

function UserPill({avatar, displayName, accountID, email, style}: UserPillProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {formatPhoneNumber} = useLocalize();

    // `displayName` is a person's name unless they never set one, in which case it is their SMS login.
    const formattedDisplayName = Str.isSMSLogin(displayName) ? formatPhoneNumber(displayName) : displayName;

    return (
        <UserDetailsTooltip
            accountID={accountID ?? CONST.DEFAULT_NUMBER_ID}
            fallbackUserDetails={{
                avatar,
                displayName: formattedDisplayName,
                login: email ?? displayName,
            }}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.alignSelfStart, styles.userPill, shouldUseNarrowLayout && styles.mw100, style]}>
                <UserAvatar
                    source={avatar}
                    size={CONST.AVATAR_SIZE.XXX_SMALL}
                    accountID={accountID ?? CONST.DEFAULT_NUMBER_ID}
                />
                <Text
                    style={styles.userPillText}
                    numberOfLines={1}
                >
                    {formattedDisplayName}
                </Text>
            </View>
        </UserDetailsTooltip>
    );
}

UserPill.displayName = 'UserPill';

export default UserPill;
