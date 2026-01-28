import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type VideoErrorIndicatorProps = {
    /** Whether it is a preview or not */
    isPreview?: boolean;
};

function VideoErrorIndicator({isPreview = false}: VideoErrorIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['VideoSlash']);

    return (
        <View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, styles.pAbsolute, styles.h100, styles.w100]}>
            <Icon
                fill={isPreview ? theme.border : theme.icon}
                src={expensifyIcons.VideoSlash}
                width={variables.eReceiptEmptyIconWidth}
                height={variables.eReceiptEmptyIconWidth}
            />
            {!isPreview && (
                <View>
                    <Text style={[styles.notFoundTextHeader, styles.ph11]}>{translate('common.errorOccurredWhileTryingToPlayVideo')}</Text>
                </View>
            )}
        </View>
    );
}

export default VideoErrorIndicator;
