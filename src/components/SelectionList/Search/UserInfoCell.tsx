import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {SearchAccountDetails} from '@src/types/onyx/SearchResults';

type UserInfoCellProps = {
    participant: SearchAccountDetails;
    displayName: string;
};

function UserInfoCell({participant, displayName}: UserInfoCellProps) {
    const styles = useThemeStyles();

    const avatarURL = participant?.avatarURL ?? participant?.avatar;
    const isWorkspace = participant?.avatarURL !== undefined;
    const iconType = isWorkspace ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR;

    return (
        <View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatarURL}
                name={displayName}
                type={iconType}
                avatarID={isWorkspace ? participant?.id : participant?.accountID}
            />
            <Text
                numberOfLines={1}
                style={[styles.textMicroBold, styles.flexShrink1]}
            >
                {displayName}
            </Text>
        </View>
    );
}

UserInfoCell.displayName = 'UserInfoCell';

export default UserInfoCell;
