import {render, screen} from '@testing-library/react-native';
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {MultifactorAuthenticationContextProviders, useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MultifactorAuthenticationModalNavigator from '@navigation/AppNavigator/Navigators/MultifactorAuthenticationModalNavigator';
import waitForBatchedUpdatesWithAct from '../../waitForBatchedUpdatesWithAct';

/** The queryable markers the state tests assert against. `OutcomeScreenBase` is the success or failure
 *  screen's testID, and the backdrop's `common.close` label only ever renders inside the mounted navigator. */
const OUTCOME_SCREEN_TEST_ID = 'OutcomeScreenBase';
const MODAL_OVERLAY_LABEL = 'Close';

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
MfaControlsCapture.displayName = 'MfaControlsCapture';

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
        throw new Error('MFA UI controls were not captured. Call renderMfaUi() and flushMfaUi() first.');
    }
    return controlsHolder.current;
}

async function flushMfaUi(): Promise<void> {
    await waitForBatchedUpdatesWithAct();
}

/** True while the outcome screen (success/failure) is the visible route. */
function isOutcomeScreenVisible(): boolean {
    return screen.queryAllByTestId(OUTCOME_SCREEN_TEST_ID).length > 0;
}

/** True while the MFA overlay (navigator root + backdrop) is mounted. */
function isModalOverlayMounted(): boolean {
    return screen.queryAllByLabelText(MODAL_OVERLAY_LABEL).length > 0;
}

export {renderMfaUi, getMfaControls, flushMfaUi, isOutcomeScreenVisible, isModalOverlayMounted};
