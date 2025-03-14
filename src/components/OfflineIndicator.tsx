import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type OfflineIndicatorProps = {
    /** Optional styles for container element that will override the default styling for the offline indicator */
    containerStyles?: StyleProp<ViewStyle>;

    /** Optional styles for the container */
    style?: StyleProp<ViewStyle>;

    /** Whether to add bottom safe area padding to the view. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to make the indicator translucent. */
    isTranslucent?: boolean;
};

function OfflineIndicator({style, containerStyles: containerStylesProp, addBottomSafeAreaPadding = false, isTranslucent = false}: OfflineIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const fallbackStyle = useMemo(() => [styles.offlineIndicatorContainer, containerStylesProp], [styles.offlineIndicatorContainer, containerStylesProp]);
    const containerStyles = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding,
        style: fallbackStyle,
    });

    if (!isOffline) {
        return null;
    }

    return (
        <View style={[containerStyles, isTranslucent && styles.navigationBarBG, styles.flexRow, styles.alignItemsCenter, style]}>
            <Icon
                fill={theme.icon}
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
