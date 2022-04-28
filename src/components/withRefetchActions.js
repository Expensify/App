import React from 'react';
import compose from '../libs/compose';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';

export default fetchData => (WrappedComponent) => {
    const propTypes = {
        /** Information about the network */
        network: networkPropTypes.isRequired,
    };

    class WithRefetchActions extends React.Component {
        componentDidUpdate(prevProps) {
            if (prevProps.network.isOffline === this.props.network.isOffline) {
                return;
            }

            fetchData();
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                />
            );
        }
    }

    WithRefetchActions.propTypes = propTypes;

    // eslint-disable-next-line rulesdir/no-useless-compose
    return compose(
        withNetwork(),
    )(WithRefetchActions);
};
