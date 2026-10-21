/** Exercises writable DOM scrolling and the native input boundary. */
import type * as InputUtilsModule from '@libs/InputUtils/index';
import {scrollToBottom as scrollNativeToBottom, scrollToRight as scrollNativeToRight} from '@libs/InputUtils/index.native';
import type {ScrollInput} from '@libs/InputUtils/types';

import type {TextInput} from 'react-native';

import createMock from '../utils/createMock';

const {moveSelectionToEnd, scrollToBottom, scrollToRight} = jest.requireActual<typeof InputUtilsModule>('@libs/InputUtils/index.ts');

describe('InputUtils', () => {
    it.each(['input', 'textarea', 'div'] as const)('scrolls an actual %s to its bottom and right edges', (tagName) => {
        // Given RN Web inputs/textarea elements and live-markdown divs expose writable scroll offsets.
        const input = document.createElement(tagName);
        Object.defineProperties(input, {scrollHeight: {value: 120}, scrollWidth: {value: 230}});

        // When both existing scrolling operations execute against the host node.
        scrollToBottom(input);
        scrollToRight(input);

        // Then each operation uses its own dimension, including the markdown and multiline producers.
        expect(input.scrollTop).toBe(120);
        expect(input.scrollLeft).toBe(230);
    });

    it('assigns zero dimensions instead of retaining a prior scroll offset', () => {
        // Given an emptied input still has offsets from its previous content.
        const input = document.createElement('input');
        input.scrollTop = 12;
        input.scrollLeft = 34;

        // When the current dimensions are zero.
        scrollToBottom(input);
        scrollToRight(input);

        // Then zero is a real assignment, not an absent dimension.
        expect(input.scrollTop).toBe(0);
        expect(input.scrollLeft).toBe(0);
    });

    it('does not write getter-only native scroll fields or scroll in the native sibling', () => {
        // Given ReactNativeElement inherits getter-only scroll fields from ReadOnlyElement.
        const nativeInput = createMock<TextInput>({
            get scrollTop() {
                return 11;
            },
            get scrollLeft() {
                return 22;
            },
            scrollHeight: 120,
            scrollWidth: 230,
        });
        const input: Parameters<ScrollInput>[0] = nativeInput;

        // When property presence could otherwise admit a native ref into DOM scrolling.
        expect(() => {
            scrollToBottom(input);
            scrollToRight(input);
            scrollNativeToBottom(input);
            scrollNativeToRight(input);
        }).not.toThrow();

        // Then no native write occurs despite the fields being present.
        expect(nativeInput.scrollTop).toBe(11);
        expect(nativeInput.scrollLeft).toBe(22);
    });

    it('moves an input selection to its end and leaves native selection alone', () => {
        // Given the existing selection operation owns only setSelectionRange inputs.
        const input = document.createElement('input');
        input.value = 'hello';
        input.setSelectionRange(0, 2);
        const setSelection = jest.fn<ReturnType<TextInput['setSelection']>, Parameters<TextInput['setSelection']>>();
        const nativeInput = createMock<TextInput>({setSelection});

        // When selection-to-end runs on each supported category.
        moveSelectionToEnd(input);
        moveSelectionToEnd(nativeInput);

        // Then the DOM caret moves to the exact text length without a native dispatch.
        expect(input.selectionStart).toBe(5);
        expect(input.selectionEnd).toBe(5);
        expect(setSelection).not.toHaveBeenCalled();
    });
});
