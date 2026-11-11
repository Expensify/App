import attachmentModalHandler from '@libs/AttachmentModalHandler/index.ios';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

jest.mock('@libs/Log', () => ({
    info: jest.fn(),
    warn: jest.fn(),
}));

describe('iOS AttachmentModalHandler', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(async () => {
        await jest.runAllTimersAsync();
        jest.useRealTimers();
    });

    it('closes an idle attachment immediately without waiting for a future transition', () => {
        // Given an attachment whose opening transition has finished, Back must initiate its own closing transition.
        const closeAttachment = jest.fn();

        // When the user closes it without any transition running.
        attachmentModalHandler.handleModalClose(closeAttachment);

        // Then navigation can start without advancing the future transition timeout.
        expect(closeAttachment).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(0);
    });

    it.each(['navigation', 'other'] as const)('waits for an active %s transition before closing', (kind) => {
        // Given an opening or keyboard transition that must finish before dismissal.
        const transition = TransitionTracker.startTransition(kind);
        const closeAttachment = jest.fn();

        // When Back is pressed during that transition.
        attachmentModalHandler.handleModalClose(closeAttachment);
        expect(closeAttachment).not.toHaveBeenCalled();
        TransitionTracker.endTransition(transition);

        // Then dismissal starts as soon as the existing transition ends, without waiting for a new one.
        expect(closeAttachment).toHaveBeenCalledTimes(1);
    });

    it('closes once after all overlapping transitions finish and ignores later transitions', async () => {
        // Given overlapping transitions, ending only one must not release the close callback.
        const openingTransition = TransitionTracker.startTransition('navigation');
        const keyboardTransition = TransitionTracker.startTransition();
        const closeAttachment = jest.fn();

        // When Back is pressed and the existing transitions finish in sequence.
        attachmentModalHandler.handleModalClose(closeAttachment);
        TransitionTracker.endTransition(openingTransition);
        expect(closeAttachment).not.toHaveBeenCalled();
        TransitionTracker.endTransition(keyboardTransition);

        // Then the close callback runs once, even after another transition and any pending timers finish.
        expect(closeAttachment).toHaveBeenCalledTimes(1);
        const closingTransition = TransitionTracker.startTransition('navigation');
        TransitionTracker.endTransition(closingTransition);
        await jest.runAllTimersAsync();
        expect(closeAttachment).toHaveBeenCalledTimes(1);
    });
});
