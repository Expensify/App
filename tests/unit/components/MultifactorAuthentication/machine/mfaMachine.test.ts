import createInitEvent, {MFA_TEST_PAYLOAD} from 'tests/utils/mfa/flowFixtures';
import {createActor} from 'xstate';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';

describe('MFA machine context', () => {
    it('copies the INIT payload into the flow context', () => {
        const actor = createActor(
            mfaMachine.provide({
                actions: {
                    navigateToSuccessOutcome: () => {},
                },
            }),
        ).start();

        actor.send(createInitEvent(MFA_TEST_PAYLOAD));

        expect(actor.getSnapshot().context.payload).toEqual(MFA_TEST_PAYLOAD);
        actor.stop();
    });
});
