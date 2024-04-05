import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
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
};

function AttachmentOfflineIndicator({isPreview = false}: AttachmentOfflineIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

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
                    <Text style={[styles.notFoundTextHeader]}>{translate('common.youAppearToBeOffline')}</Text>
                    <Text>{translate('common.attachementWillBeAvailableOnceBackOnline')}</Text>
                </View>
            )}
        </View>
    );
}

AttachmentOfflineIndicator.displayName = 'AttachmentOfflineIndicator';

export default AttachmentOfflineIndicator;
