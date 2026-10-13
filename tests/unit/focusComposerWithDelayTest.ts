import focusComposerWithDelay from '@libs/focusComposerWithDelay';

import CONST from '@src/CONST';

function createInput() {
    const input = document.createElement('textarea');
    return {input, focus: jest.spyOn(input, 'focus')};
}

describe('focusComposerWithDelay', () => {
    // jest/setupAfterEnv.ts switches every suite back to real timers, so the config's global fake timers have to be re-enabled here.
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it('focuses the input after the delay', async () => {
        const {input, focus} = createInput();

        await focusComposerWithDelay(input)(true);
        jest.runAllTimers();

        expect(focus).toHaveBeenCalled();
    });

    it('does not focus the input when the condition no longer holds once the delay is up', async () => {
        const {input, focus} = createInput();
        let hasFocusClaim = true;

        await focusComposerWithDelay(input, CONST.COMPOSER_FOCUS_DELAY, () => hasFocusClaim)(true);
        hasFocusClaim = false;
        jest.runAllTimers();

        expect(focus).not.toHaveBeenCalled();
    });

    it('focuses the input when the condition still holds once the delay is up', async () => {
        const {input, focus} = createInput();

        await focusComposerWithDelay(input, CONST.COMPOSER_FOCUS_DELAY, () => true)(true);
        jest.runAllTimers();

        expect(focus).toHaveBeenCalled();
    });

    it('focuses an editor that mounts after the delayed focus request', async () => {
        // Given an edit transition that requests focus before the input ref is attached.
        const {input, focus} = createInput();
        let currentInput: HTMLTextAreaElement | null = null;

        // When the editor mounts before the focus delay ends.
        await focusComposerWithDelay(() => currentInput)(true);
        currentInput = input;
        jest.runAllTimers();

        // Then the mounted editor receives focus instead of losing the request.
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('does not focus an editor that unmounts before the delay ends', async () => {
        // Given a focus request for an editor that is still mounted.
        const {input, focus} = createInput();
        let currentInput: HTMLTextAreaElement | null = input;
        await focusComposerWithDelay(() => currentInput)(true);

        // When navigation removes the editor before the delayed request runs.
        currentInput = null;
        jest.runAllTimers();

        // Then the stale input does not take focus back.
        expect(focus).not.toHaveBeenCalled();
    });

    it('focuses the replacement editor instead of the old input', async () => {
        // Given a pending focus request while the composer is changing its layout.
        const original = createInput();
        const replacement = createInput();
        let currentInput = original.input;
        await focusComposerWithDelay(() => currentInput)(true);

        // When the input ref changes before the focus delay ends.
        currentInput = replacement.input;
        jest.runAllTimers();

        // Then only the current editor receives focus.
        expect(original.focus).not.toHaveBeenCalled();
        expect(replacement.focus).toHaveBeenCalledTimes(1);
    });
});
