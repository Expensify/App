import UserAvatar from '@components/Avatar/UserAvatar';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import type {AvatarSizeName} from '@styles/utils';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type UserInfoCellProps = {
    accountID: number | undefined;
    avatar: AvatarSource | undefined;
    displayName: string;
    avatarSize?: AvatarSizeName;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: TextStyle;
    avatarStyle?: ViewStyle;
    isLargeScreenWidth?: boolean;
};

function UserInfoCell({avatar, accountID, displayName, avatarSize, containerStyle, textStyle, avatarStyle, isLargeScreenWidth}: UserInfoCellProps) {
    const styles = useThemeStyles();

    if (!isCorrectSearchUserName(displayName) || !accountID) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <UserAvatar
                imageStyles={styles.alignSelfCenter}
                size={avatarSize ?? CONST.AVATAR_SIZE.XXX_SMALL}
                source={avatar}
                accountID={accountID}
                containerStyles={[styles.pr2, avatarStyle]}
            />
            <Text
                numberOfLines={1}
                style={[isLargeScreenWidth ? styles.themeTextColor : styles.textMicroSupporting, styles.flexShrink1, textStyle]}
            >
                {displayName}
            </Text>
        </View>
    );
}

export default UserInfoCell;
