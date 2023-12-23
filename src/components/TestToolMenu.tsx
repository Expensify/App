import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ApiUtils from '@libs/ApiUtils';
import compose from '@libs/compose';
import * as Network from '@userActions/Network';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import NetworkOnyx from '@src/types/onyx/Network';
import UserOnyx from '@src/types/onyx/User';
import Button from './Button';
import {withNetwork} from './OnyxProvider';
import Switch from './Switch';
import TestToolRow from './TestToolRow';
import Text from './Text';

type TestToolMenuOnyxProps = {
    /** User object in Onyx */
    user: OnyxEntry<UserOnyx>;
};

type TestToolMenuProps = TestToolMenuOnyxProps & {
    /** Network object in Onyx */
    network: OnyxEntry<NetworkOnyx>;
};

const USER_DEFAULT: UserOnyx = {shouldUseStagingServer: undefined, isSubscribedToNewsletter: false, validated: false, isFromPublicDomain: false, isUsingExpensifyCard: false};

function TestToolMenu({user = USER_DEFAULT, network}: TestToolMenuProps) {
    const shouldUseStagingServer = user?.shouldUseStagingServer ?? ApiUtils.isUsingStagingApi();
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
                        isOn={shouldUseStagingServer}
                        onToggle={() => User.setShouldUseStagingServer(!shouldUseStagingServer)}
                    />
                </TestToolRow>
            )}

            {/* When toggled the app will be forced offline. */}
            <TestToolRow title="Force offline">
                <Switch
                    accessibilityLabel="Force offline"
                    isOn={!!network?.shouldForceOffline}
                    onToggle={() => Network.setShouldForceOffline(!network?.shouldForceOffline)}
                />
            </TestToolRow>

            {/* When toggled all network requests will fail. */}
            <TestToolRow title="Simulate failing network requests">
                <Switch
                    accessibilityLabel="Simulate failing network requests"
                    isOn={!!network?.shouldFailAllRequests}
                    onToggle={() => Network.setShouldFailAllRequests(!network?.shouldFailAllRequests)}
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

TestToolMenu.displayName = 'TestToolMenu';

export default compose(
    withOnyx<TestToolMenuProps, TestToolMenuOnyxProps>({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
    withNetwork(),
)(TestToolMenu);
