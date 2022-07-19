import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import variables from '../styles/variables';
import Text from './Text';
import styles from '../styles/styles';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions from './withWindowDimensions';

const propTypes = {
    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

const OfflineIndicator = (props) => {
    if (!props.network.isOffline) {
        return null;
    }

    return (
        <View style={[
            props.isSmallScreenWidth ? styles.offlineIndicatorMobile : styles.offlineIndicator,
            styles.flexRow,
            styles.alignItemsCenter]}
        >
            <Icon
                src={Expensicons.Offline}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
            />
            <Text style={[styles.ml2, styles.chatItemComposeSecondaryRowSubText]}>
                {props.translate('common.youAppearToBeOffline')}
            </Text>
        </View>
    );
};

OfflineIndicator.propTypes = propTypes;
OfflineIndicator.displayName = 'OfflineIndicator';

export default compose(
    withWindowDimensions,
    withLocalize,
    withNetwork(),
)(OfflineIndicator);
