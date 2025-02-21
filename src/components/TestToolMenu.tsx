import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isUsingStagingApi} from '@libs/ApiUtils';
import {setShouldFailAllRequests, setShouldForceOffline, setShouldSimulatePoorConnection} from '@userActions/Network';
import {expireSessionWithDelay, invalidateAuthToken, invalidateCredentials} from '@userActions/Session';
import {setIsDebugModeEnabled, setShouldUseStagingServer} from '@userActions/User';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {User as UserOnyx} from '@src/types/onyx';
import Button from './Button';
import Switch from './Switch';
import TestCrash from './TestCrash';
import TestToolRow from './TestToolRow';
import Text from './Text';

const USER_DEFAULT: UserOnyx = {
    shouldUseStagingServer: undefined,
    isSubscribedToNewsletter: false,
    validated: false,
    isFromPublicDomain: false,
    isUsingExpensifyCard: false,
    isDebugModeEnabled: false,
};

function TestToolMenu() {
    const [network] = useOnyx(ONYXKEYS.NETWORK);
    const [user = USER_DEFAULT] = useOnyx(ONYXKEYS.USER);
    const [isUsingImportedState] = useOnyx(ONYXKEYS.IS_USING_IMPORTED_STATE);
    const shouldUseStagingServer = user?.shouldUseStagingServer ?? isUsingStagingApi();
    const isDebugModeEnabled = !!user?.isDebugModeEnabled;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    // Check if the user is authenticated to show options that require authentication
    const isAuthenticated = useMemo(() => !!(session?.authToken ?? null), [session]);

    return (
        <>
            <Text
                style={[styles.textLabelSupporting, styles.mb4]}
                numberOfLines={1}
            >
                {translate('initialSettingsPage.troubleshoot.testingPreferences')}
            </Text>
            {isAuthenticated && (
                <>
                    {/* Authenticated options */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.debugMode')}>
                        <Switch
                            accessibilityLabel={translate('initialSettingsPage.troubleshoot.debugMode')}
                            isOn={isDebugModeEnabled}
                            onToggle={() => setIsDebugModeEnabled(!isDebugModeEnabled)}
                        />
                    </TestToolRow>

                    {/* Instantly invalidates a user's local authToken. Useful for testing flows related to reauthentication. */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.authenticationStatus')}>
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.invalidate')}
                            onPress={() => invalidateAuthToken()}
                        />
                    </TestToolRow>

                    {/* Invalidate stored user auto-generated credentials. Useful for manually testing sign out logic. */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.deviceCredentials')}>
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.destroy')}
                            onPress={() => invalidateCredentials()}
                        />
                    </TestToolRow>

                    {/* Sends an expired session to the FE and invalidates the session by the same time in the BE. Action is delayed for 15s */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.authenticationStatus')}>
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.invalidateWithDelay')}
                            onPress={() => expireSessionWithDelay()}
                        />
                    </TestToolRow>
                </>
            )}
            {/* Options available regardless of authentication */}
            {!CONFIG.IS_USING_LOCAL_WEB && (
                <TestToolRow title={translate('initialSettingsPage.troubleshoot.useStagingServer')}>
                    <Switch
                        accessibilityLabel="Use Staging Server"
                        isOn={shouldUseStagingServer}
                        onToggle={() => setShouldUseStagingServer(!shouldUseStagingServer)}
                    />
                </TestToolRow>
            )}
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.forceOffline')}>
                <Switch
                    accessibilityLabel="Force offline"
                    isOn={!!network?.shouldForceOffline}
                    onToggle={() => setShouldForceOffline(!network?.shouldForceOffline)}
                    disabled={!!isUsingImportedState || !!network?.shouldSimulatePoorConnection || network?.shouldFailAllRequests}
                />
            </TestToolRow>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.simulatePoorConnection')}>
                <Switch
                    accessibilityLabel="Simulate poor internet connection"
                    isOn={!!network?.shouldSimulatePoorConnection}
                    onToggle={() => setShouldSimulatePoorConnection(!network?.shouldSimulatePoorConnection, network?.poorConnectionTimeoutID)}
                    disabled={!!isUsingImportedState || !!network?.shouldFailAllRequests || network?.shouldForceOffline}
                />
            </TestToolRow>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.simulatFailingNetworkRequests')}>
                <Switch
                    accessibilityLabel="Simulate failing network requests"
                    isOn={!!network?.shouldFailAllRequests}
                    onToggle={() => setShouldFailAllRequests(!network?.shouldFailAllRequests)}
                    disabled={!!network?.shouldForceOffline || network?.shouldSimulatePoorConnection}
                />
            </TestToolRow>
            <TestCrash />
        </>
    );
}

TestToolMenu.displayName = 'TestToolMenu';

export default TestToolMenu;
