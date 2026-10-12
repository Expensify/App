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
});
