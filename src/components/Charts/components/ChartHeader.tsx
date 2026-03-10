import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';

type ChartHeaderProps = {
    title: string | undefined;
    titleIcon: IconAsset | undefined;
};

function ChartHeader({title, titleIcon}: ChartHeaderProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        !!title && (
            <View style={styles.chartHeader}>
                {!!titleIcon && (
                    <Icon
                        src={titleIcon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        fill={theme.icon}
                    />
                )}
                <Text style={[styles.textLabelSupporting, styles.chartTitle]}>{title}</Text>
            </View>
        )
    );
}

ChartHeader.displayName = 'ChartHeader';

export default ChartHeader;
