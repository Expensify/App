import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {OnyxEntry} from 'react-native-onyx/lib/types';
import compose from '@libs/compose';
import styles from '@styles/styles';
import variables from '@styles/variables';
import type {Network} from '@src/types/onyx';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import {withNetwork} from './OnyxProvider';
import Text from './Text';
import withLocalize from './withLocalize';
import withWindowDimensions from './withWindowDimensions';

type OfflineIndicatorProps = {
    /** Information about the network */
    network: OnyxEntry<Network>;

    /** Optional styles for container element that will override the default styling for the offline indicator */
    containerStyles?: StyleProp<ViewStyle>;

    /** Optional styles for the container */
    style?: StyleProp<ViewStyle>;

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: boolean;

    // TODO: remove after withLocalize migrated
    /** Returns translated string for given locale and phrase */
    translate: (value: string) => string;
};

const setStyles = (containerStyles: StyleProp<ViewStyle>, isSmallScreenWidth: boolean): StyleProp<ViewStyle> => {
    if (!!containerStyles && ((Array.isArray(containerStyles) && containerStyles.length) || Object.keys(containerStyles).length)) {
        return containerStyles;
    }

    return isSmallScreenWidth ? styles.offlineIndicatorMobile : styles.offlineIndicator;
};

function OfflineIndicator({network, isSmallScreenWidth, translate, style = [], containerStyles = []}: OfflineIndicatorProps) {
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

// TODO: remove when withWindowDimensions, withLocalize are migrated
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default compose(withWindowDimensions, withLocalize, withNetwork())(OfflineIndicator);
