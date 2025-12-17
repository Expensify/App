import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

type ExportedIconCellProps = {
    reportID?: string;
};

function ExportedIconCell({reportID}: ExportedIconCellProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Table']);

    if (!reportID) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            <Icon
                src={icons.Table}
                small
            />
            <Icon
                src={icons.Table}
                small
            />
            <Icon
                src={icons.Table}
                small
            />
            <Icon
                src={icons.Table}
                small
            />
            <Icon
                src={icons.Table}
                small
            />
        </View>
    );
}

export default ExportedIconCell;
