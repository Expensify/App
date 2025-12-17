import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ExportedIconCellProps = {
    reportID?: string;
};

function ExportedIconCell({reportID}: ExportedIconCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const reportActions = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['Document', 'NetSuiteSquare', 'XeroSquare', 'IntacctSquare', 'QBOSquare']);

    console.log(reportActions);

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
