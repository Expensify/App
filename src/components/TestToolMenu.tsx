import useIsAgentAccount from '@hooks/useIsAgentAccount';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useSidebarOrderedReportsActions} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';

import {isUsingStagingApi} from '@libs/ApiUtils';

import {setShouldFailAllRequests, setShouldForceOffline, setShouldSimulatePoorConnection} from '@userActions/Network';
import {expireSessionWithDelay, invalidateAuthToken, invalidateCredentials} from '@userActions/Session';
import {setIsDebugModeEnabled, setShouldShowBranchNameInTitle, setShouldUseStagingServer} from '@userActions/User';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {Platform} from 'react-native';

import BiometricsTestToolRow from './BiometricsTestToolRow';
import Button from './ButtonComposed';
import QAAuthTestToolRows from './QAAuthTestToolRows';
import SoftKillTestToolRow from './SoftKillTestToolRow';
import Switch from './Switch';
import TestCrash from './TestCrash';
import TestToolRow from './TestToolRow';
import Text from './Text';

function TestToolMenu() {
    const [network] = useOnyx(ONYXKEYS.NETWORK);
    const [isUsingImportedState] = useOnyx(ONYXKEYS.IS_USING_IMPORTED_STATE);
    const [shouldUseStagingServer = isUsingStagingApi()] = useOnyx(ONYXKEYS.SHOULD_USE_STAGING_SERVER);
    const [isDebugModeEnabled = false] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const [shouldShowBranchNameInTitle = false] = useOnyx(ONYXKEYS.SHOULD_SHOW_BRANCH_NAME_IN_TITLE);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {clearLHNCache} = useSidebarOrderedReportsActions();

    // Check if the user is authenticated to show options that require authentication
    const isAuthenticated = useIsAuthenticated();

    // Agent accounts can't have biometric multifactor authentication, so hide the biometrics test row for them.
    const isAgentAccount = useIsAgentAccount();

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
                    {/* When toggled the app will be put into debug mode. */}
                    <TestToolRow
                        title={translate('initialSettingsPage.troubleshoot.debugMode')}
                        isTitleAccessible={false}
                    >
                        <Switch
                            accessibilityLabel={translate('initialSettingsPage.troubleshoot.debugMode')}
                            isOn={isDebugModeEnabled}
                            onToggle={() => setIsDebugModeEnabled(!isDebugModeEnabled)}
                        />
                    </TestToolRow>

                    {/* When toggled on web, the current git branch name is prepended to the browser tab title. */}
                    {Platform.OS === 'web' && !!__GIT_BRANCH__ && (
                        <TestToolRow title={translate('initialSettingsPage.troubleshoot.showBranchNameInTitle')}>
                            <Switch
                                accessibilityLabel={translate('initialSettingsPage.troubleshoot.showBranchNameInTitle')}
                                isOn={shouldShowBranchNameInTitle}
                                onToggle={() => setShouldShowBranchNameInTitle(!shouldShowBranchNameInTitle)}
                            />
                        </TestToolRow>
                    )}

                    {/* Instantly invalidates a user's local authToken. Useful for testing flows related to reauthentication. */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.authenticationStatus')}>
                        <Button
                            size={CONST.BUTTON_SIZE.SMALL}
                            onPress={() => invalidateAuthToken()}
                        >
                            <Button.Text>{translate('initialSettingsPage.troubleshoot.invalidate')}</Button.Text>
                        </Button>
                    </TestToolRow>

                    {/* Clears stored auto-generated credentials, corrupts the local authToken and fires a request so reauth fails and the user is signed out. Useful for manually testing sign out logic. */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.deviceCredentials')}>
                        <Button
                            size={CONST.BUTTON_SIZE.SMALL}
                            onPress={() => invalidateCredentials()}
                        >
                            <Button.Text>{translate('initialSettingsPage.troubleshoot.destroy')}</Button.Text>
                        </Button>
                    </TestToolRow>

                    {/* Sends an expired session to the FE and invalidates the session by the same time in the BE. Action is delayed for 15s */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.authenticationStatus')}>
                        <Button
                            size={CONST.BUTTON_SIZE.SMALL}
                            onPress={() => expireSessionWithDelay()}
                        >
                            <Button.Text>{translate('initialSettingsPage.troubleshoot.invalidateWithDelay')}</Button.Text>
                        </Button>
                    </TestToolRow>

                    {/* Clears the useSidebarOrderedReports cache to re-compute from latest onyx values */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.leftHandNavCache')}>
                        <Button
                            size={CONST.BUTTON_SIZE.SMALL}
                            onPress={clearLHNCache}
                        >
                            <Button.Text>{translate('initialSettingsPage.troubleshoot.clearleftHandNavCache')}</Button.Text>
                        </Button>
                    </TestToolRow>

                    {/* Allows testing and revoking biometric multifactor authentication */}
                    {isAgentAccount === false && <BiometricsTestToolRow />}
                </>
            )}

            {/* Option to switch between staging and default api endpoints.
        This enables QA, internal testers and external devs to take advantage of sandbox environments for 3rd party services like Plaid and Onfido.
        This toggle is not rendered for internal devs as they make environment changes directly to the .env file. */}
            {!CONFIG.IS_USING_LOCAL_WEB && (
                <TestToolRow
                    title={translate('initialSettingsPage.troubleshoot.useStagingServer')}
                    isTitleAccessible={false}
                >
                    <Switch
                        accessibilityLabel="Use Staging Server"
                        isOn={shouldUseStagingServer}
                        onToggle={() => setShouldUseStagingServer(!shouldUseStagingServer)}
                    />
                </TestToolRow>
            )}

            {/* QA server auth flow. Web only, and only when it is configured. */}
            <QAAuthTestToolRows />

            {/* When toggled the app will be forced offline. */}
            <TestToolRow
                title={translate('initialSettingsPage.troubleshoot.forceOffline')}
                isTitleAccessible={false}
            >
                <Switch
                    accessibilityLabel="Force offline"
                    isOn={!!network?.shouldForceOffline}
                    onToggle={() => setShouldForceOffline(!network?.shouldForceOffline)}
                    disabled={!!isUsingImportedState || !!network?.shouldSimulatePoorConnection || network?.shouldFailAllRequests}
                />
            </TestToolRow>

            {/* When toggled the app will randomly change internet connection every 2-5 seconds */}
            <TestToolRow
                title={translate('initialSettingsPage.troubleshoot.simulatePoorConnection')}
                isTitleAccessible={false}
            >
                <Switch
                    accessibilityLabel="Simulate poor internet connection"
                    isOn={!!network?.shouldSimulatePoorConnection}
                    onToggle={() => setShouldSimulatePoorConnection(!network?.shouldSimulatePoorConnection)}
                    disabled={!!isUsingImportedState || !!network?.shouldFailAllRequests || network?.shouldForceOffline}
                />
            </TestToolRow>

            {/* When toggled all network requests will fail. */}
            <TestToolRow
                title={translate('initialSettingsPage.troubleshoot.simulateFailingNetworkRequests')}
                isTitleAccessible={false}
            >
                <Switch
                    accessibilityLabel="Simulate failing network requests"
                    isOn={!!network?.shouldFailAllRequests}
                    onToggle={() => setShouldFailAllRequests(!network?.shouldFailAllRequests)}
                    disabled={!!network?.shouldForceOffline || network?.shouldSimulatePoorConnection}
                />
            </TestToolRow>
            <SoftKillTestToolRow />
            <TestCrash />
        </>
    );
}

export default TestToolMenu;
