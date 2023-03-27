import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import Switch from './Switch';
import Text from './Text';
import * as User from '../libs/actions/User';
import * as Network from '../libs/actions/Network';
import * as Session from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import Button from './Button';
import TestToolRow from './TestToolRow';
import networkPropTypes from './networkPropTypes';
import compose from '../libs/compose';
import {withNetwork} from './OnyxProvider';
import * as ApiUtils from '../libs/ApiUtils';

const propTypes = {
    /** User object in Onyx */
    user: PropTypes.shape({
        /** Whether we should use the staging version of the secure API server */
        shouldUseStagingServer: PropTypes.bool,
    }),

    /** Network object in Onyx */
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    user: {
        // The default value is environment specific and can't be set with `defaultProps` (ENV is not resolved yet)
        // When undefined (during render) STAGING defaults to `true`, other envs default to `false`
        shouldUseStagingServer: undefined,
    },
};

const TestToolMenu = props => (
    <>
        <Text style={[styles.textLabelSupporting, styles.mb2, styles.mt6]} numberOfLines={1}>
            Test Preferences
        </Text>

        {/* Option to switch between staging and default api endpoints.
        This enables QA and internal testers to take advantage of sandbox environments for 3rd party services like Plaid and Onfido. */}
        <TestToolRow title="Use Staging Server">
            <Switch
                isOn={lodashGet(props, 'user.shouldUseStagingServer', ApiUtils.isUsingStagingApi())}
                onToggle={() => User.setShouldUseStagingServer(
                    !lodashGet(props, 'user.shouldUseStagingServer', ApiUtils.isUsingStagingApi()),
                )}
            />
        </TestToolRow>

        {/* When toggled the app will be forced offline. */}
        <TestToolRow title="Force offline">
            <Switch
                isOn={Boolean(props.network.shouldForceOffline)}
                onToggle={() => Network.setShouldForceOffline(!props.network.shouldForceOffline)}
            />
        </TestToolRow>

        {/* When toggled all network requests will fail. */}
        <TestToolRow title="Simulate failing network requests">
            <Switch
                isOn={Boolean(props.network.shouldFailAllRequests)}
                onToggle={() => Network.setShouldFailAllRequests(!props.network.shouldFailAllRequests)}
            />
        </TestToolRow>

        {/* Instantly invalidates a user's local authToken. Useful for testing flows related to reauthentication. */}
        <TestToolRow title="Authentication status">
            <Button
                small
                text="Invalidate"
                onPress={() => Session.invalidateAuthToken()}
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
TestToolMenu.displayName = 'TestToolMenu';

export default compose(
    withNetwork(),
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(TestToolMenu);
