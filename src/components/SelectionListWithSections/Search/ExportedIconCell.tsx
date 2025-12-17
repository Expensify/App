import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ExportedIconCellProps = {
    reportID?: string;
};

function ExportedIconCell({reportID}: ExportedIconCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Document', 'NetSuiteSquare', 'XeroSquare', 'IntacctSquare', 'QBOSquare']);

    if (!reportID) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            <Icon
                src={icons.Document}
                fill={theme.icon}
                small
            />
            <Avatar
                source={icons.NetSuiteSquare}
                type={CONST.ICON_TYPE_AVATAR}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
            />
            <Avatar
                source={icons.XeroSquare}
                type={CONST.ICON_TYPE_AVATAR}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
            />
            <Avatar
                source={icons.IntacctSquare}
                type={CONST.ICON_TYPE_AVATAR}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
            />
            <Avatar
                source={icons.QBOSquare}
                type={CONST.ICON_TYPE_AVATAR}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
            />
        </View>
    );
}

export default ExportedIconCell;
