import getNativeAmountFilterInputKeyboard from '@libs/getAmountFilterInputKeyboard/index.native';
import type getAmountFilterInputKeyboard from '@libs/getAmountFilterInputKeyboard/index.ts';
import getAmountInputKeyboard from '@libs/getAmountInputKeyboard';

import CONST from '@src/CONST';

const getWebAmountFilterInputKeyboard = jest.requireActual<{default: typeof getAmountFilterInputKeyboard}>('@libs/getAmountFilterInputKeyboard/index.ts').default;

jest.mock('@libs/getAmountInputKeyboard', () => jest.fn());

describe('getAmountFilterInputKeyboard', () => {
    it('uses the default decimal input mode and a sign button on web', () => {
        // Given web keyboards that do not support the native numbers-and-punctuation layout.
        // When the filter chooses its amount controls.
        const props = getWebAmountFilterInputKeyboard();

        // Then NumberWithSymbolForm keeps its decimal input mode and exposes Flip for negative amounts.
        expect(props).toEqual({keyboardType: undefined, shouldShowFlipButton: true});
    });

    it.each([CONST.KEYBOARD_TYPE.DECIMAL_PAD, CONST.KEYBOARD_TYPE.NUMBERS_AND_PUNCTUATION])('keeps the native %s keyboard without adding a sign button', (keyboardType) => {
        // Given the existing native keyboard selection for signed amounts.
        jest.mocked(getAmountInputKeyboard).mockReturnValue({keyboardType, inputMode: undefined});

        // When an amount filter requests its keyboard controls.
        const props = getNativeAmountFilterInputKeyboard();

        // Then native platforms retain their current keyboard and direct minus entry.
        expect(getAmountInputKeyboard).toHaveBeenCalledWith(true);
        expect(props).toEqual({keyboardType, inputMode: undefined, shouldShowFlipButton: false});
    });
});
