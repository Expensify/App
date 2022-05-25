import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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

const FullPageOfflineView = (props) => {
    if (ONYXKEYS.NETWORK.isOffline) {
        return (
            <View>
                <Text>{props.translate('reportActionCompose.youAppearToBeOffline')}</Text>
            </View>
        );
    }

    if (props.isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return props.children;
};

FullPageOfflineView.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        network: {
            key: ONYXKEYS.NETWORK,
        },
    }),
)(FullPageOfflineView);
