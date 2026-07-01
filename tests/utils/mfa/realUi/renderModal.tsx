import {render} from '@testing-library/react-native';
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {MultifactorAuthenticationContextProviders, useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MultifactorAuthenticationModalNavigator from '@navigation/AppNavigator/Navigators/MultifactorAuthenticationModalNavigator';

type MfaUiControls = {
    executeScenario: ReturnType<typeof useMultifactorAuthentication>['executeScenario'];
};

const controlsHolder: {current: MfaUiControls | undefined} = {current: undefined};

/**
 * Renders nothing. It sits inside the providers only to capture the live context API so the event
 * executors can start a flow through the public API.
 */
function MfaControlsCapture() {
    const {executeScenario} = useMultifactorAuthentication();
    useEffect(() => {
        controlsHolder.current = {executeScenario};
    });
    return null;
}

const INITIAL_SAFE_AREA_METRICS = {
    frame: {x: 0, y: 0, width: 390, height: 844},
    insets: {top: 0, left: 0, right: 0, bottom: 0},
};

/** Mounts the real provider stack and the real MFA modal navigator the app renders in production. */
function renderMfaUi() {
    controlsHolder.current = undefined;
    return render(
        <SafeAreaProvider initialMetrics={INITIAL_SAFE_AREA_METRICS}>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <MultifactorAuthenticationContextProviders>
                    <MfaControlsCapture />
                    <MultifactorAuthenticationModalNavigator />
                </MultifactorAuthenticationContextProviders>
            </ComposeProviders>
        </SafeAreaProvider>,
    );
}

function getMfaControls(): MfaUiControls {
    if (!controlsHolder.current) {
        throw new Error('MFA UI controls were not captured. Call renderMfaUi() and await waitForBatchedUpdatesWithAct() first.');
    }
    return controlsHolder.current;
}

export {renderMfaUi, getMfaControls};
