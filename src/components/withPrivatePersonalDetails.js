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
    /** User's private personal details */
    privatePersonalDetails: privatePersonalDetailsPropTypes,
};

const withPrivatePersonalDetailsDefaultProps = {
    privatePersonalDetails: privatePersonalDetailsDefaultProps,
};

const privatePersonalDetailsProviderPropTypes = {
    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,

    ...withPrivatePersonalDetailsPropTypes,
};

const privatePersonalDetailsProviderDefaultProps = {
    ...withPrivatePersonalDetailsDefaultProps,
};

class PrivatePersonalDetailsProvider extends React.Component {
    componentDidMount() {
        if (this.props.network.isOffline) {
            return;
        }

        PersonalDetails.openPersonalDetailsPage();
    }

    componentDidUpdate(prevProps) {
        if (this.props.network.isOffline || _.isEqual(_.omit(prevProps.privatePersonalDetails, 'isLoading'), _.omit(this.props.privatePersonalDetails, 'isLoading'))) {
            return;
        }

        PersonalDetails.openPersonalDetailsPage();
    }

    render() {
        return (
            <PrivatePersonalDetailsContext.Provider value={this.props}>{this.props.children}</PrivatePersonalDetailsContext.Provider>
        );
    }
}

PrivatePersonalDetailsProvider.propTypes = privatePersonalDetailsProviderPropTypes;
PrivatePersonalDetailsProvider.defaultProps = privatePersonalDetailsProviderDefaultProps;

const Provider = compose(
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
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
