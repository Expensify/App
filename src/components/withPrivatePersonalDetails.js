import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import {withNetwork} from './OnyxProvider';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import networkPropTypes from './networkPropTypes';
import privatePersonalDetailsPropTypes, {privatePersonalDetailsDefaultProps} from '../pages/settings/Profile/PersonalDetails/privatePersonalDetailsPropTypes';

const PrivatePersonalDetailsContext = createContext(null);

const withPrivatePersonalDetailsPropTypes = {
    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** User's private personal details */
    privatePersonalDetails: privatePersonalDetailsPropTypes,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        authToken: PropTypes.string,
    }),
};

const withPrivatePersonalDetailsDefaultProps = {
    privatePersonalDetails: privatePersonalDetailsDefaultProps,
};

const privatePersonalDetailsProviderPropTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,

    ...withPrivatePersonalDetailsPropTypes,
};

const privatePersonalDetailsProviderDefaultProps = {
    ...withPrivatePersonalDetailsDefaultProps,
    session: {
        authToken: null,
    },
};

function isAuthenticated(session) {
    return Boolean(_.get(session, 'authToken', null));
}

class PrivatePersonalDetailsProvider extends React.Component {
    componentDidMount() {
        if (this.props.network.isOffline || !isAuthenticated(this.props.session)) {
            return;
        }

        PersonalDetails.openPersonalDetailsPage();
    }

    componentDidUpdate(prevProps) {
        // Only open personal detail page if the network is online, and the state is transitioning from unauthenticated to authenticated
        if (this.props.network.isOffline ||
            !isAuthenticated(this.props.session) ||
            isAuthenticated(prevProps.session)
        ) {
            return;
        }
        PersonalDetails.openPersonalDetailsPage();
    }

    render() {
        return <PrivatePersonalDetailsContext.Provider value={this.props}>{this.props.children}</PrivatePersonalDetailsContext.Provider>;
    }
}

PrivatePersonalDetailsProvider.propTypes = privatePersonalDetailsProviderPropTypes;
PrivatePersonalDetailsProvider.defaultProps = privatePersonalDetailsProviderDefaultProps;

const Provider = compose(
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
    withNetwork(),
)(PrivatePersonalDetailsProvider);

Provider.displayName = 'withOnyx(PrivatePersonalDetailsProvider)';

/**
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
export default function withPrivatePersonalDetails(WrappedComponent) {
    const WithPrivatePersonalDetails = forwardRef((props, ref) => (
        <PrivatePersonalDetailsContext.Consumer>
            {(privatePersonalDetailsProps) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...privatePersonalDetailsProps}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            )}
        </PrivatePersonalDetailsContext.Consumer>
    ));

    WithPrivatePersonalDetails.displayName = `withPrivatePersonalDetails(${getComponentDisplayName(WrappedComponent)})`;
    return WithPrivatePersonalDetails;
}

export {withPrivatePersonalDetailsPropTypes, withPrivatePersonalDetailsDefaultProps, Provider as PrivatePersonalDetailsProvider, PrivatePersonalDetailsContext};
