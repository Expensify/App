import {render} from '@testing-library/react-native';
import React, {useEffect} from 'react';
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

/**
 * Mounts the production MFA providers and modal navigator. The global safe-area mock provides fixed
 * values without a `SafeAreaProvider`.
 */
function renderMfaUi() {
    controlsHolder.current = undefined;
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <MultifactorAuthenticationContextProviders>
                <MfaControlsCapture />
                <MultifactorAuthenticationModalNavigator />
            </MultifactorAuthenticationContextProviders>
        </ComposeProviders>,
    );
}

function getMfaControls(): MfaUiControls {
    if (!controlsHolder.current) {
        throw new Error('MFA UI controls were not captured. Call renderMfaUi() and await waitForBatchedUpdatesWithAct() first.');
    }
    return controlsHolder.current;
}

export {renderMfaUi, getMfaControls};
