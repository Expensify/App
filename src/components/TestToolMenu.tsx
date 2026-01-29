import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {revokeMultifactorAuthenticationCredentials} from '@libs/actions/MultifactorAuthentication';
import {isUsingStagingApi} from '@libs/ApiUtils';
import Navigation from '@libs/Navigation/Navigation';
import {setShouldFailAllRequests, setShouldForceOffline, setShouldSimulatePoorConnection} from '@userActions/Network';
import {expireSessionWithDelay, invalidateAuthToken, invalidateCredentials} from '@userActions/Session';
import {setIsDebugModeEnabled, setShouldUseStagingServer} from '@userActions/User';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Account} from '@src/types/onyx';
import Button from './Button';
import SoftKillTestToolRow from './SoftKillTestToolRow';
import Switch from './Switch';
import TestCrash from './TestCrash';
import TestToolRow from './TestToolRow';
import Text from './Text';

function getHasBiometricsRegistered(data: OnyxEntry<Account>) {
    return data?.multifactorAuthenticationPublicKeyIDs && data.multifactorAuthenticationPublicKeyIDs.length > 0;
}

function TestToolMenu() {
    const [network] = useOnyx(ONYXKEYS.NETWORK, {canBeMissing: true});
    const [isUsingImportedState] = useOnyx(ONYXKEYS.IS_USING_IMPORTED_STATE, {canBeMissing: true});
    const [shouldUseStagingServer = isUsingStagingApi()] = useOnyx(ONYXKEYS.SHOULD_USE_STAGING_SERVER, {canBeMissing: true});
    const [isDebugModeEnabled = false] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED, {canBeMissing: true});
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {clearLHNCache} = useSidebarOrderedReports();
    const [hasBiometricsRegistered = false] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true, selector: getHasBiometricsRegistered});

    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    /**
     * The wrapper is needed to prevent rapid double‑taps on native from triggering multiple navigations.
     * Context: https://github.com/Expensify/App/pull/79475#discussion_r2708230681
     */
    const navigateToBiometricsTestPage = singleExecution(
        waitForNavigate(() => {
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_BIOMETRICS_TEST);
        }),
    );

    // Check if the user is authenticated to show options that require authentication
    const isAuthenticated = useIsAuthenticated();

    // Temporary hardcoded false, expected behavior: status fetched from the MultifactorAuthenticationContext
    const biometricsTitle = translate('multifactorAuthentication.biometricsTest.troubleshootBiometricsStatus', {registered: hasBiometricsRegistered});

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

                    {/* Clears the useSidebarOrderedReports cache to re-compute from latest onyx values */}
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.leftHandNavCache')}>
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.clearleftHandNavCache')}
                            onPress={clearLHNCache}
                        />
                    </TestToolRow>

                    {/* Allows testing the biometric multifactor authentication flow */}
                    <TestToolRow title={biometricsTitle}>
                        <View style={[styles.flexRow, styles.gap2]}>
                            <Button
                                small
                                text={translate('multifactorAuthentication.biometricsTest.test')}
                                onPress={() => navigateToBiometricsTestPage()}
                            />
                            {hasBiometricsRegistered && (
                                <Button
                                    danger
                                    small
                                    text={translate('multifactorAuthentication.revoke.remove')}
                                    onPress={() => {
                                        revokeMultifactorAuthenticationCredentials();
                                    }}
                                />
                            )}
                        </View>
                    </TestToolRow>
                </>
            )}

            {/* Option to switch between staging and default api endpoints.
        This enables QA, internal testers and external devs to take advantage of sandbox environments for 3rd party services like Plaid and Onfido.
        This toggle is not rendered for internal devs as they make environment changes directly to the .env file. */}
            {!CONFIG.IS_USING_LOCAL_WEB && (
                <TestToolRow title={translate('initialSettingsPage.troubleshoot.useStagingServer')}>
                    <Switch
                        accessibilityLabel="Use Staging Server"
                        isOn={shouldUseStagingServer}
                        onToggle={() => setShouldUseStagingServer(!shouldUseStagingServer)}
                    />
                </TestToolRow>
            )}

            {/* When toggled the app will be forced offline. */}
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.forceOffline')}>
                <Switch
                    accessibilityLabel="Force offline"
                    isOn={!!network?.shouldForceOffline}
                    onToggle={() => setShouldForceOffline(!network?.shouldForceOffline)}
                    disabled={!!isUsingImportedState || !!network?.shouldSimulatePoorConnection || network?.shouldFailAllRequests}
                />
            </TestToolRow>

            {/* When toggled the app will randomly change internet connection every 2-5 seconds */}
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.simulatePoorConnection')}>
                <Switch
                    accessibilityLabel="Simulate poor internet connection"
                    isOn={!!network?.shouldSimulatePoorConnection}
                    onToggle={() => setShouldSimulatePoorConnection(!network?.shouldSimulatePoorConnection, network?.poorConnectionTimeoutID)}
                    disabled={!!isUsingImportedState || !!network?.shouldFailAllRequests || network?.shouldForceOffline}
                />
            </TestToolRow>

            {/* When toggled all network requests will fail. */}
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.simulateFailingNetworkRequests')}>
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
