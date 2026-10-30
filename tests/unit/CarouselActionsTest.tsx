import {render} from '@testing-library/react-native';

import CarouselActions from '@components/Attachments/AttachmentCarousel/CarouselActions';

import CONST from '@src/CONST';

import React from 'react';

// Captures registered shortcuts so tests can fire them with a keyboard event targeting a chosen element
const registeredShortcuts: Record<string, (event?: Partial<KeyboardEvent>) => void> = {};
jest.mock('@hooks/useKeyboardShortcut', () => {
    return (shortcut: {shortcutKey: string}, callback: (event?: Partial<KeyboardEvent>) => void) => {
        registeredShortcuts[shortcut.shortcutKey] = callback;
    };
});

/** Mirrors the PDF scroller that PDFView focuses so arrow keys scroll the PDF */
function focusPDFScroller(): HTMLDivElement {
    const scroller = document.createElement('div');
    scroller.tabIndex = -1;
    document.body.appendChild(scroller);
    scroller.focus();
    return scroller;
}

function pressArrowKey(shortcutKey: string, target: HTMLElement) {
    registeredShortcuts[shortcutKey]?.({target});
}

describe('CarouselActions', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it.each([CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey])(
        'keeps the PDF scroller focused when %s cannot move the carousel',
        (shortcutKey) => {
            // Given a single PDF attachment whose scroller has focus, so the carousel has nowhere to move
            const onCycleThroughAttachments = jest.fn(() => false);
            render(<CarouselActions onCycleThroughAttachments={onCycleThroughAttachments} />);
            const scroller = focusPDFScroller();

            // When the user presses an arrow key
            pressArrowKey(shortcutKey, scroller);

            // Then the scroller stays focused, because blurring it would stop the Down key from scrolling the PDF
            expect(onCycleThroughAttachments).toHaveBeenCalledTimes(1);
            expect(document.activeElement).toBe(scroller);
        },
    );

    it.each([CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey])('blurs the focused element when %s moves the carousel', (shortcutKey) => {
        // Given an attachment with other attachments next to it, whose PDF scroller has focus
        const onCycleThroughAttachments = jest.fn(() => true);
        render(<CarouselActions onCycleThroughAttachments={onCycleThroughAttachments} />);
        const scroller = focusPDFScroller();

        // When the user presses an arrow key and the carousel moves to another attachment
        pressArrowKey(shortcutKey, scroller);

        // Then focus leaves the scroller, so no focus ring is left highlighting the modal
        expect(onCycleThroughAttachments).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(document.body);
    });
});
