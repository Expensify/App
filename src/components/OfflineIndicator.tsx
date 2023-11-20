import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useWindowDimensions from '@hooks/useWindowDimensions';
import styles from '@styles/styles';
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

const setStyles = (containerStyles: StyleProp<ViewStyle>, isSmallScreenWidth: boolean): StyleProp<ViewStyle> => {
    if (containerStyles) {
        return containerStyles;
    }

    return isSmallScreenWidth ? styles.offlineIndicatorMobile : styles.offlineIndicator;
};

function OfflineIndicator({style, containerStyles}: OfflineIndicatorProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();

    if (!isOffline) {
        return null;
    }

    return (
        <View style={[setStyles(containerStyles, isSmallScreenWidth), styles.flexRow, styles.alignItemsCenter, style]}>
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
