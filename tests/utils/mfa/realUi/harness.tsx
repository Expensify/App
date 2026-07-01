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
 * Mounts the real provider stack and the real MFA modal navigator the app renders in production. No
 * SafeAreaProvider: the global `react-native-safe-area-context` mock returns fixed insets/frame from
 * plain hooks, so nothing in the tree needs a provider above it.
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

/** The confirm button's testID on the outcome screen (see OutcomeScreenBase). Queried instead of the visible label. */
const CONFIRM_BUTTON_TEST_ID = 'MultifactorAuthenticationOutcomeConfirmButton';

/**
 * Maps each machine event to the gesture (or system step) that produces it in production. The model
 * walk drives the real UI through this dictionary, one entry per event.
 *
 * Not every event is a DOM gesture in this slice. `INIT` is fired by an external consumer through the
 * public API (no button inside the MFA modal starts a flow), and `MODAL_CLOSED` is the navigator's
 * teardown signal rather than a user action, so here we run the exact callback the navigator handed us.
 * `satisfies Record<MfaEventType, ...>` makes a new machine event a compile error until it gets an executor.
 */
/* eslint-disable @typescript-eslint/naming-convention -- keys mirror the machine's event type union. */
const mfaEventExecutors = {
    INIT: async () => {
        await act(async () => {
            await getMfaControls().executeScenario(MFA_TEST_SCENARIO_NAME);
        });
        await waitForBatchedUpdatesWithAct();
        // The transparent initial screen's onLayout does not fire in jsdom. Calling the exact handler it
        // wires runs the buffered push to the outcome screen, just like a real layout pass.
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
