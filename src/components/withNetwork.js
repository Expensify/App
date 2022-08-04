import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import networkPropTypes from './networkPropTypes';

/**
 * An HOC that passes current network status as a prop to the WrappedComponent
 *
 * When transitioning from offline -> online, this.props.network.isReconnecting
 * will be true.
 *
 * @param {Component} [WrappedComponent] the component that needs network status
 * @returns {Component} the component with network status provided
 */
export default function (WrappedComponent) {
    const propTypes = {
        forwardedRef: PropTypes.func,

        /** Information about the network */
        network: networkPropTypes.isRequired,
    };

    const defaultProps = {
        forwardedRef: () => {},
    };

    class WithNetwork extends Component {
        constructor(props) {
            super(props);
            this.isReconnecting = false;
        }

        shouldComponentUpdate(nextProps) {
            // we check for reconnecting here so that we can pass this as a prop on render
            this.isReconnecting = this.props.network.isOffline && !nextProps.network.isOffline;

            return true;
        }

        render() {
            // eslint-disable-next-line react/destructuring-assignment
            const {forwardedRef, ...rest} = this.props;

            // isReconnecting
            const network = {
                ...this.props.network,
                isReconnecting: this.isReconnecting,
            };
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                    ref={forwardedRef}
                    network={network}
                />
            );
        }
    }

    WithNetwork.propTypes = propTypes;
    WithNetwork.defaultProps = defaultProps;
    WithNetwork.displayName = `withNetowrk(${getComponentDisplayName(WrappedComponent)})`;

    const componentWithRef = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithNetwork {...props} forwardedRef={ref} />
    ));

    return withOnyx({
        network: {
            key: ONYXKEYS.NETWORK,
        },
    })(componentWithRef);
}
