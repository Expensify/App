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

type MfaControlsRef = {current: MfaUiControls | undefined};

/**
 * Renders nothing. It sits inside the providers only to capture the live context API so the
 * `executeScenario` returned by `renderMfaUi` can start a flow through the public API.
 */
function MfaControlsCapture({controlsRef}: {controlsRef: MfaControlsRef}) {
    const {executeScenario} = useMultifactorAuthentication();
    useEffect(() => {
        // eslint-disable-next-line no-param-reassign -- the ref exists to carry the capture out to `renderMfaUi`.
        controlsRef.current = {executeScenario};
    }, [controlsRef, executeScenario]);
    return null;
}

/**
 * Mounts the production MFA providers and modal navigator. The global safe-area mock provides fixed
 * values without a `SafeAreaProvider`. The returned `executeScenario` reads the captured controls at
 * call time because the provider recreates the context API on every render.
 */
function renderMfaUi() {
    const controlsRef: MfaControlsRef = {current: undefined};

    const renderResult = render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <MultifactorAuthenticationContextProviders>
                <MfaControlsCapture controlsRef={controlsRef} />
                <MultifactorAuthenticationModalNavigator />
            </MultifactorAuthenticationContextProviders>
        </ComposeProviders>,
    );

    const executeScenario: MfaUiControls['executeScenario'] = (scenarioName, ...args) => {
        if (!controlsRef.current) {
            throw new Error('MFA UI controls were not captured. Await waitForBatchedUpdatesWithAct() after renderMfaUi() first.');
        }
        return controlsRef.current.executeScenario(scenarioName, ...args);
    };

    return {executeScenario, ...renderResult};
}

export default renderMfaUi;
