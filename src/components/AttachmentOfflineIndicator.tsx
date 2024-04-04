import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type AttachmentOfflineIndicatorProps = {
    /** Optional styles for container element that will override the default styling for the offline indicator */
    containerStyles?: StyleProp<ViewStyle>;

    /** Optional styles for the container */
    style?: StyleProp<ViewStyle>;
};

function AttachmentOfflineIndicator({containerStyles, title, subtitle, isPreview = false}: AttachmentOfflineIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();

    const computedStyles = useMemo((): StyleProp<ViewStyle> => {
        if (containerStyles) {
            return containerStyles;
        }

        return isSmallScreenWidth ? styles.offlineIndicatorMobile : styles.offlineIndicator;
    }, [containerStyles, isSmallScreenWidth, styles.offlineIndicatorMobile, styles.offlineIndicator]);

    if (!isOffline) {
        return null;
    }

    return (
        <View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, styles.h100, styles.w100]}>
            <Icon
                fill={theme.offline}
                src={Expensicons.OfflineCloud}
                width={variables.iconSizeSuperLarge}
                height={variables.iconSizeSuperLarge}
            />
            {!isPreview && (
                <View>
                    <Text style={[styles.notFoundTextHeader]}>{title}</Text>
                    <Text>{subtitle}</Text>
                </View>
            )}
        </View>
    );
}

AttachmentOfflineIndicator.displayName = 'OfflineIndicator';

export default AttachmentOfflineIndicator;
