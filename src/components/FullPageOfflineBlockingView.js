import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Icon from './Icon';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import compose from '../libs/compose';

const propTypes = {
    /** Child elements */
    children: PropTypes.node.isRequired,

    isLoading: PropTypes.bool.isRequired,

    error: PropTypes.string,

    /** Props to fetch translation features */
    ...withLocalizePropTypes,
};

const FullPageOfflineBlockingView = (props) => {
    if (ONYXKEYS.NETWORK.isOffline) {
        return (
            <View
                style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}
            >
                <Icon
                    src={Expensicons.OfflineCloud}
                    fill={themeColors.offline}
                    width={50}
                    height={50}
                />
                <Text style={[styles.h1]}>{props.translate('common.youAppearToBeOffline')}</Text>
                <Text>{props.translate('common.thisFeatureRequiresInternet')}</Text>
            </View>
        );
    }

    if (props.isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return props.children;
};

FullPageOfflineBlockingView.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        network: {
            key: ONYXKEYS.NETWORK,
        },
    }),
)(FullPageOfflineBlockingView);
