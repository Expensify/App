import React from 'react';
import PropTypes from 'prop-types';
import networkPropTypes from '../networkPropTypes';
import {withNetwork} from '../OnyxProvider';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as Expensicons from '../Icon/Expensicons';
import compose from '../../libs/compose';
import BlockingView from './BlockingView';

const propTypes = {
    /** Child elements */
    children: PropTypes.node.isRequired,

    /** Props to fetch translation features */
    ...withLocalizePropTypes,

    /** Props to detect online status */
    network: networkPropTypes.isRequired,
};

const FullPageOfflineBlockingView = (props) => {
    if (props.network.isOffline) {
        return (
            <BlockingView
                icon={Expensicons.OfflineCloud}
                title={props.translate('common.youAppearToBeOffline')}
                subtitle={props.translate('common.thisFeatureRequiresInternet')}
            />
        );
    }

    return props.children;
};

FullPageOfflineBlockingView.propTypes = propTypes;
FullPageOfflineBlockingView.displayName = 'FullPageOfflineBlockingView';

export default compose(
    withLocalize,
    withNetwork(),
)(FullPageOfflineBlockingView);
