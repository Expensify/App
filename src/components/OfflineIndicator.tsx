import React, {useMemo} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type OfflineIndicatorProps = {
    /** Optional styles for container element that will override the default styling for the offline indicator */
    containerStyles?: StyleProp<ViewStyle>;

    /** Optional styles for the container */
    style?: StyleProp<ViewStyle>;
};

function OfflineIndicator({style, containerStyles}: OfflineIndicatorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
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
        <View style={[computedStyles, styles.flexRow, styles.alignItemsCenter, style]}>
            <Icon
                src={Expensicons.OfflineCloud}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <Text style={[styles.ml3, styles.chatItemComposeSecondaryRowSubText]}>{translate('common.youAppearToBeOffline')}</Text>
        </View>
    );
}

OfflineIndicator.displayName = 'OfflineIndicator';

export default OfflineIndicator;
