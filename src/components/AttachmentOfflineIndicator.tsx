import React, {useEffect, useState} from 'react';
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

    // We don't want to show the offline indicator when the attachment is a cached one, so
    // we delay the display by 200 ms to ensure it is not a cached one.
    const [onCacheDelay, setOnCacheDelay] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => setOnCacheDelay(false), 200);

        return () => clearTimeout(timeout);
    }, []);

    if (!isOffline || onCacheDelay) {
        return null;
    }

    return (
        <View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, styles.pAbsolute, styles.h100, styles.w100, isPreview && styles.hoveredComponentBG]}>
            <Icon
                fill={theme.icon}
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
