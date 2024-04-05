import React from 'react';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type AttachmentOfflineIndicatorProps = {
    /** Whether the offline indicator is displayed for the attachment preview. */
    isPreview?: boolean;

    /** Title text to be displayed. */
    title: string;

    /** Subtitle text to be displayed. */
    subtitle: string;
};

function AttachmentOfflineIndicator({title, subtitle, isPreview = false}: AttachmentOfflineIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    if (!isOffline) {
        return null;
    }

    return (
        <View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, styles.h100, styles.w100]}>
            <Icon
                fill={theme.border}
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

AttachmentOfflineIndicator.displayName = 'AttachmentOfflineIndicator';

export default AttachmentOfflineIndicator;
