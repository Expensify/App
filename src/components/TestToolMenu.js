import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../styles/styles';
import Switch from './Switch';
import Text from './Text';
import * as User from '../libs/actions/User';
import * as Network from '../libs/actions/Network';
import * as Session from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import Button from './Button';
import * as NetworkStore from '../libs/Network/NetworkStore';
import TestToolRow from './TestToolRow';
import networkPropTypes from './networkPropTypes';
import compose from '../libs/compose';
import {withNetwork} from './OnyxProvider';

const propTypes = {
    /** User object in Onyx */
    user: PropTypes.shape({
        /** Whether we should use the staging version of the secure API server */
        shouldUseSecureStaging: PropTypes.bool,
    }),

    /** Network object in Onyx */
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    user: {
        shouldUseSecureStaging: false,
    },
};

const TestToolMenu = props => (
    <>
        <Text style={[styles.formLabel]} numberOfLines={1}>
            Test Preferences
        </Text>

        {/* Option to switch from using the staging secure endpoint or the production secure endpoint.
        This enables QA and internal testers to take advantage of sandbox environments for 3rd party services like Plaid and Onfido. */}
        <TestToolRow title="Use Secure Staging Server">
            <Switch
                isOn={props.user.shouldUseSecureStaging || false}
                onToggle={() => User.setShouldUseSecureStaging(!props.user.shouldUseSecureStaging)}
            />
        </TestToolRow>

        {/* When toggled all network requests will fail. */}
        <TestToolRow title="Simulate failing network requests">
            <Switch
                isOn={props.network.shouldFailAllRequests || false}
                onToggle={() => Network.setShouldFailAllRequests(!props.network.shouldFailAllRequests)}
            />
        </TestToolRow>

        {/* Instantly invalidates a user's local authToken. Useful for testing flows related to reauthentication. */}
        <TestToolRow title="Authentication status">
            <Button
                small
                text="Invalidate"
                onPress={() => NetworkStore.setAuthToken('pizza')}
            />
        </TestToolRow>

        {/* Invalidate stored user auto-generated credentials. Useful for manually testing sign out logic. */}
        <TestToolRow title="Device credentials">
            <Button
                small
                text="Destroy"
                onPress={() => Session.invalidateCredentials()}
            />
        </TestToolRow>
    </>
);

TestToolMenu.propTypes = propTypes;
TestToolMenu.defaultProps = defaultProps;
export default compose(
    withNetwork(),
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(TestToolMenu);
