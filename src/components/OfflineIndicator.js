import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import variables from '../styles/variables';
import Text from './Text';
import styles from '../styles/styles';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Additional style props */
    style: stylePropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    style: [],
};

const OfflineIndicator = (props) => {
    if (!props.network.isOffline) {
        return null;
    }

    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];

    return (
        <View style={[styles.flexRow, ...additionalStyles]}>
            <Icon
                src={Expensicons.Offline}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
            />
            <Text style={[styles.ml2, styles.chatItemComposeSecondaryRowSubText]}>
                {props.translate('youAppearToBeOffline.youAppearToBeOffline')}
            </Text>
        </View>
    );
};

OfflineIndicator.propTypes = propTypes;
OfflineIndicator.defaultProps = defaultProps;
OfflineIndicator.displayName = 'OfflineIndicator';

export default compose(
    withLocalize,
    withNetwork(),
)(OfflineIndicator);
