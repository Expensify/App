import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React, {useEffect} from 'react';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {MultifactorAuthenticationContextProviders, useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';
import {handleInitialScreenLayout} from '@components/MultifactorAuthentication/mfaNavigation';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MultifactorAuthenticationModalNavigator from '@navigation/AppNavigator/Navigators/MultifactorAuthenticationModalNavigator';
import waitForBatchedUpdatesWithAct from '../../waitForBatchedUpdatesWithAct';
import {MFA_TEST_SCENARIO_NAME} from '../flowFixtures';
import {pendingModalClose} from './mocks';

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

type MfaEventType = MfaEvent['type'];
type MfaEventExecutor = () => Promise<void>;

/** This stable testID keeps the test independent of translated button text. */
const CONFIRM_BUTTON_TEST_ID = 'MultifactorAuthenticationOutcomeConfirmButton';

/**
 * `INIT` enters through the public API, while `MODAL_CLOSED` runs the navigator's teardown callback.
 * `satisfies Record<MfaEventType, ...>` requires an explicit executor for every machine event.
 */
/* eslint-disable @typescript-eslint/naming-convention -- keys mirror the machine's event type union. */
const mfaEventExecutors = {
    INIT: async () => {
        await act(async () => {
            await getMfaControls().executeScenario(MFA_TEST_SCENARIO_NAME);
        });
        await waitForBatchedUpdatesWithAct();
        // The initial screen's `onLayout` does not fire in jsdom, so the test calls the same handler to flush the
        // buffered navigation.
        act(() => handleInitialScreenLayout());
        await waitForBatchedUpdatesWithAct();
    },
    CLOSE_MODAL: async () => {
        fireEvent.press(screen.getByTestId(CONFIRM_BUTTON_TEST_ID));
        await waitForBatchedUpdatesWithAct();
    },
    MODAL_CLOSED: async () => {
        act(() => pendingModalClose.run());
        await waitForBatchedUpdatesWithAct();
    },
} satisfies Record<MfaEventType, MfaEventExecutor>;
/* eslint-enable @typescript-eslint/naming-convention */

export {renderMfaUi, mfaEventExecutors};
