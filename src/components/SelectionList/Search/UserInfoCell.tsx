import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {SearchAccountDetails} from '@src/types/onyx/SearchResults';

type UserInfoCellProps = {
    participant: SearchAccountDetails;
    displayName: string;
};

function UserInfoCell({participant, displayName}: UserInfoCellProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useWindowDimensions();
    const avatarURL = participant?.avatarURL ?? participant?.avatar;
    const isWorkspace = participant?.avatarURL !== undefined;
    const iconType = isWorkspace ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR;

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatarURL}
                name={displayName}
                type={iconType}
                avatarID={isWorkspace ? participant?.id : participant?.accountID}
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
