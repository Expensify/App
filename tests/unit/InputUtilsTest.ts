import {render} from '@testing-library/react-native';

import {moveSelectionToEnd, scrollToBottom, scrollToRight} from '@libs/InputUtils';
import type * as InputUtilsModule from '@libs/InputUtils';

import {createElement, createRef} from 'react';
import {TextInput} from 'react-native';

// Jest prefers index.native.ts, so load the web implementation for DOM scrolling.
jest.mock('@libs/InputUtils', () => jest.requireActual<typeof InputUtilsModule>('@libs/InputUtils/index.ts'));

describe('InputUtils', () => {
    it('leaves a native TextInput without DOM scroll properties alone', () => {
        // Given a mounted native TextInput ref without DOM scrolling capabilities
        const ref = createRef<TextInput>();
        const screen = render(createElement(TextInput, {ref}));
        const input = ref.current;
        expect(input).not.toBeNull();
        if (!input) {
            screen.unmount();
            return;
        }
        // When the web scroll helpers receive the native ref
        // Then they return without adding DOM scroll properties
        expect(() => scrollToBottom(input)).not.toThrow();
        expect(() => scrollToRight(input)).not.toThrow();
        expect('scrollTop' in input).toBe(false);
        expect('scrollLeft' in input).toBe(false);
        screen.unmount();
    });
    it('scrolls DOM inputs to their vertical and horizontal limits', () => {
        // Given an input with nonzero offsets and scroll dimensions
        const input = document.createElement('input');
        input.scrollTop = 4;
        input.scrollLeft = 7;
        Object.defineProperties(input, {scrollHeight: {value: 90}, scrollWidth: {value: 120}});
        // When both scroll operations run
        scrollToBottom(input);
        scrollToRight(input);
        // Then each offset equals its own dimension
        expect(input.scrollTop).toBe(90);
        expect(input.scrollLeft).toBe(120);
    });

    it('scrolls multiline web TextInput textarea hosts to both limits', () => {
        // Given the textarea host produced by a multiline React Native Web TextInput
        const textarea = document.createElement('textarea');
        textarea.scrollTop = 4;
        textarea.scrollLeft = 7;
        Object.defineProperties(textarea, {scrollHeight: {value: 90}, scrollWidth: {value: 120}});
        // When both scroll operations run on that web host
        // @ts-expect-error -- The native TextInput ref type omits its runtime web textarea host.
        scrollToBottom(textarea);
        // @ts-expect-error -- The native TextInput ref type omits its runtime web textarea host.
        scrollToRight(textarea);
        // Then each offset equals its own dimension
        expect(textarea.scrollTop).toBe(90);
        expect(textarea.scrollLeft).toBe(120);
    });

    it('preserves zero scroll dimensions', () => {
        // Given an input with zero scroll dimensions and old offsets
        const input = document.createElement('input');
        input.scrollTop = 4;
        input.scrollLeft = 7;
        Object.defineProperties(input, {scrollHeight: {value: 0}, scrollWidth: {value: 0}});
        // When both scroll operations run
        scrollToBottom(input);
        scrollToRight(input);
        // Then zero is assigned, rather than treated as an absent capability
        expect(input.scrollTop).toBe(0);
        expect(input.scrollLeft).toBe(0);
    });

    it('moves the DOM selection to the end of its value', () => {
        // Given an input with a selection before the end
        const input = document.createElement('input');
        input.value = 'hello';
        input.setSelectionRange(1, 2);
        // When the selection helper runs
        moveSelectionToEnd(input);
        // Then both endpoints move to the value length
        expect(input.selectionStart).toBe(5);
        expect(input.selectionEnd).toBe(5);
    });
});
