import {act, fireEvent, screen} from '@testing-library/react-native';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';
import {handleInitialScreenLayout} from '@components/MultifactorAuthentication/mfaNavigation';
import waitForBatchedUpdatesWithAct from '../../waitForBatchedUpdatesWithAct';
import {MFA_TEST_SCENARIO_NAME} from '../flowFixtures';
import {pendingModalClose} from './mocks';
import {getMfaControls} from './renderModal';

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

export default mfaEventExecutors;
