import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import type {InputType} from '@libs/focusComposerWithDelay/types';

function createInput() {
    const input = {
        focus: jest.fn(),
        isFocused: jest.fn(() => false),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {input: input as unknown as InputType, focus: input.focus};
}

describe('focusComposerWithDelay', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
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

        await focusComposerWithDelay(input, 150, () => hasFocusClaim)(true);
        // Another composer takes focus while the delayed focus is still pending.
        hasFocusClaim = false;
        jest.runAllTimers();

        expect(focus).not.toHaveBeenCalled();
    });

    it('focuses the input when the condition still holds once the delay is up', async () => {
        const {input, focus} = createInput();

        await focusComposerWithDelay(input, 150, () => true)(true);
        jest.runAllTimers();

        expect(focus).toHaveBeenCalled();
    });
});
