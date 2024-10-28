import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUIUtils from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchPersonalDetails} from '@src/types/onyx/SearchResults';

type UserInfoCellProps = {
    participant: SearchPersonalDetails;
    displayName: string;
};

function UserInfoCell({participant, displayName}: UserInfoCellProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const avatarURL = participant?.avatar;

    if (!SearchUIUtils.isCorrectSearchUserName(displayName)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatarURL}
                name={displayName}
                type={CONST.ICON_TYPE_AVATAR}
                avatarID={participant?.accountID}
                containerStyles={[styles.pr2]}
            />
            <Text
                numberOfLines={1}
                style={[isLargeScreenWidth ? styles.themeTextColor : [styles.textMicro, styles.textBold], styles.flexShrink1]}
            >
                {displayName}
            </Text>
        </View>
    );
}

UserInfoCell.displayName = 'UserInfoCell';

export default UserInfoCell;
