import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import type {AvatarSizeName} from '@styles/utils';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {SearchPersonalDetails} from '@src/types/onyx/SearchResults';

type UserInfoCellProps = {
    participant: SearchPersonalDetails | PersonalDetails;
    displayName: string;
    avatarSize?: AvatarSizeName;
};

function UserInfoCell({participant, displayName, avatarSize}: UserInfoCellProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const avatarURL = participant?.avatar;

    if (!isCorrectSearchUserName(displayName)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={avatarSize ?? CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatarURL}
                name={displayName}
                type={CONST.ICON_TYPE_AVATAR}
                avatarID={participant?.accountID}
                containerStyles={[styles.pr2]}
            />
            <Text
                numberOfLines={1}
                style={[isLargeScreenWidth ? styles.themeTextColor : styles.textMicroBold, styles.flexShrink1]}
            >
                {displayName}
            </Text>
        </View>
    );
}

UserInfoCell.displayName = 'UserInfoCell';

export default UserInfoCell;
