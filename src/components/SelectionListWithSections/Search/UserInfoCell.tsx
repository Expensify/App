import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import type {AvatarSizeName} from '@styles/utils';
import CONST from '@src/CONST';

type UserInfoCellProps = {
    accountID: number | undefined;
    avatar: AvatarSource | undefined;
    displayName: string;
    avatarSize?: AvatarSizeName;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: TextStyle;
    avatarStyle?: ViewStyle;
};

function UserInfoCell({avatar, accountID, displayName, avatarSize, containerStyle, textStyle, avatarStyle}: UserInfoCellProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();

    if (!isCorrectSearchUserName(displayName) || !accountID) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={avatarSize ?? CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatar}
                name={displayName}
                type={CONST.ICON_TYPE_AVATAR}
                avatarID={accountID}
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
