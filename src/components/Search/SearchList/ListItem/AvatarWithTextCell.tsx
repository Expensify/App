import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

type AvatarWithTextCellProps = {
    reportName?: string;
    icon?: Icon;
};

function AvatarWithTextCell({reportName, icon}: AvatarWithTextCellProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();

    if (!reportName || !icon) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {!!icon && (
                <Avatar
                    source={icon.source}
                    name={icon.name}
                    avatarID={icon.id}
                    type={icon.type}
                    fallbackIcon={icon.fallbackIcon}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                    containerStyles={[styles.pr2]}
                />
            )}

            {!!reportName && (
                <Text
                    numberOfLines={1}
                    style={[isLargeScreenWidth ? styles.themeTextColor : styles.textMicroBold, styles.flexShrink1]}
                >
                    {reportName}
                </Text>
            )}
        </View>
    );
}

export default AvatarWithTextCell;
