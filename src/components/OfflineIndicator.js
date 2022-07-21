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

    /** Styles for container element */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    containerStyles: [],
};

const OfflineIndicator = (props) => {
    if (!props.network.isOffline) {
        return null;
    }

    return (
        <View style={[
            ...props.containerStyles,
            props.containerStyles.length === 0 ? (props.isSmallScreenWidth ? styles.offlineIndicatorMobile : styles.offlineIndicator) : [],
            styles.flexRow,
            styles.alignItemsCenter]}
        >
            <Icon
                src={Expensicons.OfflineCloud}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <Text style={[styles.ml3, styles.chatItemComposeSecondaryRowSubText]}>
                {props.translate('common.youAppearToBeOffline')}
            </Text>
        </View>
    );
};

OfflineIndicator.propTypes = propTypes;
OfflineIndicator.defaultProps = defaultProps;
OfflineIndicator.displayName = 'OfflineIndicator';

export default compose(
    withWindowDimensions,
    withLocalize,
    withNetwork(),
)(OfflineIndicator);
