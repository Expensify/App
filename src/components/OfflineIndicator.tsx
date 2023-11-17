import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {OnyxEntry} from 'react-native-onyx/lib/types';
import styles from '@styles/styles';
import variables from '@styles/variables';
import type {Network} from '@src/types/onyx';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {LocaleContextProps} from './LocaleContextProvider';
import {withNetwork} from './OnyxProvider';
import Text from './Text';
import withLocalize from './withLocalize';
import withWindowDimensions from './withWindowDimensions';
import type {WindowDimensionsProps} from './withWindowDimensions/types';

type OfflineIndicatorProps = LocaleContextProps &
    WindowDimensionsProps & {
        /** Information about the network */
        network: OnyxEntry<Network>;

        /** Optional styles for container element that will override the default styling for the offline indicator */
        containerStyles?: StyleProp<ViewStyle>;

        /** Optional styles for the container */
        style?: StyleProp<ViewStyle>;
    };

const setStyles = (containerStyles: StyleProp<ViewStyle>, isSmallScreenWidth: boolean): StyleProp<ViewStyle> => {
    if (!!containerStyles && ((Array.isArray(containerStyles) && containerStyles.length) || Object.keys(containerStyles).length)) {
        return containerStyles;
    }

    return isSmallScreenWidth ? styles.offlineIndicatorMobile : styles.offlineIndicator;
};

function OfflineIndicator({network, isSmallScreenWidth, translate, style, containerStyles}: OfflineIndicatorProps) {
    if (!network?.isOffline) {
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

// TODO: use `compose` function for HOCs composing once TypeScript issues are resolved.
export default withNetwork()(withLocalize(withWindowDimensions(OfflineIndicator)));
