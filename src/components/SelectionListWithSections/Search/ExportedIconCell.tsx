import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ExportedIconCellProps = {
    /** Pre-resolved list of integration icon names to display, from resolveExportedIconNames() */
    exportedIconNames: string[];
};

function ExportedIconCell({exportedIconNames}: ExportedIconCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const icons = useMemoizedLazyExpensifyIcons(['NetSuiteSquare', 'XeroSquare', 'IntacctSquare', 'QBOSquare', 'Table', 'ZenefitsSquare', 'BillComSquare', 'CertiniaSquare']);

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            {exportedIconNames.includes('Table') && (
                <Icon
                    src={icons.Table}
                    fill={theme.icon}
                    small
                />
            )}
            {exportedIconNames.includes('NetSuiteSquare') && (
                <Avatar
                    source={icons.NetSuiteSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {exportedIconNames.includes('XeroSquare') && (
                <Avatar
                    source={icons.XeroSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {exportedIconNames.includes('IntacctSquare') && (
                <Avatar
                    source={icons.IntacctSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {exportedIconNames.includes('QBOSquare') && (
                <Avatar
                    source={icons.QBOSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {exportedIconNames.includes('CertiniaSquare') && (
                <Avatar
                    source={icons.CertiniaSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {exportedIconNames.includes('BillComSquare') && (
                <Avatar
                    source={icons.BillComSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {exportedIconNames.includes('ZenefitsSquare') && (
                <Avatar
                    source={icons.ZenefitsSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
        </View>
    );
}

export default ExportedIconCell;
