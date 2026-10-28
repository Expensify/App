import type {WebComposerRef} from '@components/Composer/types';

import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import requestKeyboardForFocusedComposer from '@libs/focusComposerWithDelay/requestKeyboardForFocusedComposer';

import CONST from '@src/CONST';

import type {TextInput} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@libs/focusComposerWithDelay/requestKeyboardForFocusedComposer', () =>
    jest.fn<ReturnType<typeof requestKeyboardForFocusedComposer>, Parameters<typeof requestKeyboardForFocusedComposer>>(),
);

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

describe('focusComposerWithDelay command categories', () => {
    afterEach(() => jest.restoreAllMocks());

    it('focuses a web command handle without inventing a DOM selection method', async () => {
        // Given the public web handle exposes common commands and a numeric scroll getter.
        const input = {
            clear: jest.fn<ReturnType<WebComposerRef['clear']>, Parameters<WebComposerRef['clear']>>(),
            blur: jest.fn<ReturnType<WebComposerRef['blur']>, Parameters<WebComposerRef['blur']>>(),
            focus: jest.fn<ReturnType<WebComposerRef['focus']>, Parameters<WebComposerRef['focus']>>(),
            isFocused: () => false,
            scrollTop: 0,
        } satisfies WebComposerRef;

        // When focus with a forced selection reaches the unchanged platform selection helper.
        await focusComposerWithDelay(input)(false, {start: 2, end: 4});

        // Then the common focus command executes without requiring native or DOM selection capabilities.
        expect(input.focus).toHaveBeenCalledTimes(1);
        expect(input.clear).not.toHaveBeenCalled();
        expect(input.blur).not.toHaveBeenCalled();
    });

    it('keeps native top-level selection and requests the keyboard for an already focused input', async () => {
        // Given native selection belongs to the input itself, without a wrapper.
        const focus = jest.fn<ReturnType<TextInput['focus']>, Parameters<TextInput['focus']>>();
        const input = createMock<TextInput>({
            focus,
            isFocused: () => false,
            setSelection: jest.fn<ReturnType<TextInput['setSelection']>, Parameters<TextInput['setSelection']>>(),
        });
        const requestKeyboard = jest.mocked(requestKeyboardForFocusedComposer);

        // When an unfocused input receives selection and a focused input requests its keyboard.
        await focusComposerWithDelay(input)(false, {start: 1, end: 3});
        input.isFocused = () => true;
        await focusComposerWithDelay(input)(false, {start: 2, end: 2}, true);

        // Then selection uses the top-level native command and the focused branch delegates its keyboard request.
        expect(focus).toHaveBeenCalledTimes(1);
        expect(input.setSelection).toHaveBeenCalledWith(1, 3);
        expect(requestKeyboard).toHaveBeenCalledWith(input, {start: 2, end: 2});
    });
});
