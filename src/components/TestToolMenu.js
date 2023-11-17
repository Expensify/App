import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import * as ApiUtils from '@libs/ApiUtils';
import compose from '@libs/compose';
import useThemeStyles from '@styles/useThemeStyles';
import * as Network from '@userActions/Network';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import Button from './Button';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';
import Switch from './Switch';
import TestToolRow from './TestToolRow';
import Text from './Text';

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

function TestToolMenu(props) {
    const styles = useThemeStyles();
    return (
        <>
            <Text
                style={[styles.textLabelSupporting, styles.mb4]}
                numberOfLines={1}
            >
                Test Preferences
            </Text>

            {/* Option to switch between staging and default api endpoints.
        This enables QA, internal testers and external devs to take advantage of sandbox environments for 3rd party services like Plaid and Onfido.
        This toggle is not rendered for internal devs as they make environment changes directly to the .env file. */}
            {!CONFIG.IS_USING_LOCAL_WEB && (
                <TestToolRow title="Use Staging Server">
                    <Switch
                        accessibilityLabel="Use Staging Server"
                        isOn={lodashGet(props, 'user.shouldUseStagingServer', ApiUtils.isUsingStagingApi())}
                        onToggle={() => User.setShouldUseStagingServer(!lodashGet(props, 'user.shouldUseStagingServer', ApiUtils.isUsingStagingApi()))}
                    />
                </TestToolRow>
            )}

            {/* When toggled the app will be forced offline. */}
            <TestToolRow title="Force offline">
                <Switch
                    accessibilityLabel="Force offline"
                    isOn={Boolean(props.network.shouldForceOffline)}
                    onToggle={() => Network.setShouldForceOffline(!props.network.shouldForceOffline)}
                />
            </TestToolRow>

            {/* When toggled all network requests will fail. */}
            <TestToolRow title="Simulate failing network requests">
                <Switch
                    accessibilityLabel="Simulate failing network requests"
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
}

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
