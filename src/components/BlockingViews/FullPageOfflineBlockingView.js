import PropTypes from 'prop-types';
import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import BlockingView from './BlockingView';

const propTypes = {
    /** Child elements */
    children: PropTypes.node.isRequired,

    /** Props to fetch translation features */
    ...withLocalizePropTypes,

    /** Props to detect online status */
    network: networkPropTypes.isRequired,
};

function FullPageOfflineBlockingView(props) {
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
}

FullPageOfflineBlockingView.propTypes = propTypes;
FullPageOfflineBlockingView.displayName = 'FullPageOfflineBlockingView';

export default compose(withLocalize, withNetwork())(FullPageOfflineBlockingView);
