import captureInputScrolledToEndWeb from '@libs/captureInputScrolledToEnd/index.web';

import type {HostInstance} from 'react-native';

// jsdom does not lay out elements, so give the input the scroll geometry a browser would report.
function createScrollableInput(scrollHeight: number, clientHeight: number, scrollTop: number) {
    const input = document.createElement('div');
    input.tabIndex = 0;
    let currentScrollTop = scrollTop;
    Object.defineProperty(input, 'scrollHeight', {value: scrollHeight});
    Object.defineProperty(input, 'clientHeight', {value: clientHeight});
    Object.defineProperty(input, 'scrollTop', {
        get: () => currentScrollTop,
        set: (value: number) => {
            currentScrollTop = Math.min(value, scrollHeight - clientHeight);
        },
    });
    return input;
}

function mountContent(input: HTMLElement) {
    const content = document.createElement('div');
    content.appendChild(input);
    document.body.appendChild(content);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- react-native-web hands the ref over as the DOM element, so a div stands in for the host instance here
    return content as unknown as HostInstance;
}

describe('captureInputScrolledToEnd on web', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('scrolls a focused input back to the end of its text after a resize', () => {
        // Given a focused input that autofocus scrolled to the end of a long value
        const input = createScrollableInput(540, 98, 442);
        const content = mountContent(input);
        input.focus();

        // When the container captures it before changing the cap, and the resize then moves the scroll position
        const restore = captureInputScrolledToEndWeb(content);
        input.scrollTop = 0;
        restore?.();

        // Then the end of the text, where the caret is, is visible again
        expect(restore).toBeDefined();
        expect(input.scrollTop).toBe(442);
    });

    it('scrolls back to the end when the input stopped a few pixels short of it', () => {
        // Given a focused input that Chrome scrolled to just above the end of a long value, as it does when it reveals the caret after a paste
        const input = createScrollableInput(540, 98, 440);
        const content = mountContent(input);
        input.focus();

        // When the container captures it before changing the cap, and the resize then moves the scroll position
        const restore = captureInputScrolledToEndWeb(content);
        input.scrollTop = 0;
        restore?.();

        // Then it still counts as showing the end, so the last line is visible again instead of staying cut off until the next key press
        expect(restore).toBeDefined();
        expect(input.scrollTop).toBe(442);
    });

    it('leaves an input that is not showing the end of its text alone', () => {
        // Given a focused input that the user scrolled to the middle of a long value
        const input = createScrollableInput(540, 98, 100);
        const content = mountContent(input);
        input.focus();

        // When the container checks it before changing the cap
        const restore = captureInputScrolledToEndWeb(content);

        // Then there is nothing to restore, so the user's position is not changed
        expect(restore).toBeUndefined();
    });

    it('keeps the caret at the end in view when an input that fits is shrunk', () => {
        // Given a focused multiline input whose whole value fits, with autofocus' caret at the end, as on mobile web before the keyboard opens
        const input = document.createElement('textarea');
        input.value = 'Line 1\nLine 2\nTest';
        let currentScrollTop = 0;
        Object.defineProperty(input, 'scrollHeight', {value: 540});
        Object.defineProperty(input, 'clientHeight', {value: 540, configurable: true});
        Object.defineProperty(input, 'scrollTop', {
            get: () => currentScrollTop,
            set: (value: number) => {
                currentScrollTop = Math.max(0, Math.min(value, 540 - input.clientHeight));
            },
        });
        const content = mountContent(input);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);

        // When the container captures it, and the keyboard then shrinks the box to 283px
        const restore = captureInputScrolledToEndWeb(content);
        Object.defineProperty(input, 'clientHeight', {value: 283});
        restore?.();

        // Then the input scrolls to the end, so the caret and last line stay visible above the keyboard
        expect(restore).toBeDefined();
        expect(input.scrollTop).toBe(257);
    });

    it('leaves an input that fits alone when the caret is not at the end', () => {
        // Given a focused input whose value fits, with the caret moved to the start
        const input = document.createElement('textarea');
        input.value = 'Line 1\nLine 2\nTest';
        Object.defineProperty(input, 'scrollHeight', {value: 98});
        Object.defineProperty(input, 'clientHeight', {value: 98});
        const content = mountContent(input);
        input.focus();
        input.setSelectionRange(0, 0);

        // When the container checks it before changing the cap
        const restore = captureInputScrolledToEndWeb(content);

        // Then there is nothing to restore, so the browser keeps the caret where the user put it
        expect(restore).toBeUndefined();
    });

    it('ignores an input that is not focused', () => {
        // Given an input scrolled to its end while focus is somewhere else
        const input = createScrollableInput(540, 98, 442);
        const content = mountContent(input);

        // When the container checks it before changing the cap
        const restore = captureInputScrolledToEndWeb(content);

        // Then there is nothing to restore, because no caret is being kept in view
        expect(restore).toBeUndefined();
    });
});
