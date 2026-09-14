import {act, renderHook} from '@testing-library/react-native';

import useHtmlPaste from '@hooks/useHtmlPaste';

import type * as Browser from '@libs/Browser';

import type {RefObject} from 'react';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

type UseHtmlPasteReturn = {
    handlePastePlainText?: (event: ClipboardEvent) => void;
};

jest.mock('@src/hooks/useHtmlPaste', (): typeof useHtmlPaste => {
    return jest.requireActual('@hooks/useHtmlPaste/index.ts');
});

let mockIsMobileSafari = false;
jest.mock('@libs/Browser', () => {
    const browser = jest.requireActual<typeof Browser>('@libs/Browser');
    return {...browser, isMobileSafari: () => mockIsMobileSafari};
});

describe('useHtmlPaste - handlePastePlainText', () => {
    let textInputRef: RefObject<HTMLDivElement | null>;
    let textInputElement: HTMLDivElement;

    /**
     * Creates a paste event with plain-text and optional HTML clipboard data.
     *
     * @param text Plain-text clipboard content.
     * @param html HTML clipboard content.
     * @returns A paste event containing the requested clipboard data.
     */
    const createMockClipboardEvent = (text: string, html = ''): ClipboardEvent => {
        const clipboardData = createMock<DataTransfer>({
            getData: (type: string) => {
                if (type === 'text/html') {
                    return html;
                }
                return type === 'text/plain' ? text : '';
            },
            files: [],
            items: [],
            types: html ? ['text/html', 'text/plain'] : ['text/plain'],
        });
        return Object.assign(new Event('paste', {bubbles: true, cancelable: true}), {clipboardData});
    };

    const mockWindowSelection = (selectedText: string) => {
        const range = document.createRange();
        range.selectNodeContents(textInputElement);
        range.deleteContents();
        const textNode = document.createTextNode(selectedText);
        range.insertNode(textNode);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsMobileSafari = false;

        textInputElement = document.createElement('div');
        textInputElement.setAttribute('contenteditable', 'true');
        textInputElement.textContent = '';
        Object.defineProperty(textInputElement, 'isFocused', {value: () => true});
        document.body.appendChild(textInputElement);
        textInputRef = {current: textInputElement};

        if (!Range.prototype.getBoundingClientRect) {
            Range.prototype.getBoundingClientRect = () =>
                ({
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    right: 0,
                    bottom: 0,
                    x: 0,
                    y: 0,
                    toJSON: () => {},
                }) as DOMRect;
        }
    });

    afterEach(() => {
        document.body.removeChild(textInputElement);
    });

    it('Paste URL with selection → produces Markdown link', async () => {
        const selectedText = 'Expensify';
        const url = 'https://expensify.com';
        const markdownLink = `[${selectedText}](${url})`;

        mockWindowSelection(selectedText);
        const event = createMockClipboardEvent(url);

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        const {result} = renderHook<UseHtmlPasteReturn | void, void>(() => useHtmlPaste(textInputRef));
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result?.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputElement.textContent).toBe(markdownLink);
        }
    });

    it('Paste URL without selection → raw URL', async () => {
        const url = 'https://example.com';
        mockWindowSelection('');
        const event = createMockClipboardEvent(url);

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        const {result} = renderHook<UseHtmlPasteReturn | void, void>(() => useHtmlPaste(textInputRef));
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputElement.textContent).toBe(url);
        }
    });

    it('Paste non-URL text → raw paste', async () => {
        const plainText = 'Hello World';
        mockWindowSelection('what up');
        const event = createMockClipboardEvent(plainText);

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        const {result} = renderHook<UseHtmlPasteReturn | void, void>(() => useHtmlPaste(textInputRef));
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputElement.textContent).toBe(plainText);
        }
    });

    it('should not trim trailing whitespace when pasting', async () => {
        const textWithTrailingWhitespace = 'Hello World   ';
        mockWindowSelection('');
        const event = createMockClipboardEvent(textWithTrailingWhitespace);

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        const {result} = renderHook<UseHtmlPasteReturn | void, void>(() => useHtmlPaste(textInputRef));
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputElement.textContent).toBe(textWithTrailingWhitespace);
            expect(textInputElement.textContent?.endsWith('   ')).toBe(true);
        }
    });

    it('uses the Slack emoji shortcode metadata while preserving surrounding HTML formatting', async () => {
        const html = '<p>Normal Text. <img data-stringify-emoji=":tada:" alt=":smile:" src="https://a.slack-edge.com/emoji.png"> <strong>Bold</strong></p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. :tada: *Bold*');
    });

    it('falls back to image alt when only the emoji type metadata is available', async () => {
        const html = '<p>Normal Text. <img data-stringify-type="emoji" alt=":tada:" src="https://a.slack-edge.com/emoji.png"> <strong>Bold</strong></p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. :tada: *Bold*');
    });

    it('converts iOS Safari blob emoji image filenames to Unicode emoji', async () => {
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. 🎉 Bold');
    });

    it('converts multiple matching iOS Safari emoji images including skin tones', async () => {
        mockIsMobileSafari = true;
        const html =
            '<p>Start <img src="blob:https://new.expensify.com/1" alt="1f389@2x.png"> <img src="blob:https://new.expensify.com/2" alt="1f44d-1f3fd@2x.png"> <img src="blob:https://new.expensify.com/3" alt="2764-fe0f@2x.png"> <strong>Bold</strong></p>';
        const event = createMockClipboardEvent('Start :tada: :+1::skin-tone-4: :heart: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Start 🎉 👍🏽 ❤️ *Bold*');
    });

    it('validates an iOS Safari emoji against a supported Slack shortcode alias', async () => {
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f44d-1f3fd@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :thumbs_up::skin-tone-4: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. 👍🏽 Bold');
    });

    it('does not convert an iOS Safari image when the shortcode at its position represents another emoji', async () => {
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :smile: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. ![1f389@2x.png](blob:https://new.expensify.com/123) Bold');
    });

    it('does not use a shortcode elsewhere in iOS Safari plain text to validate an image', async () => {
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Code: <code>:tada:</code></p>';
        const event = createMockClipboardEvent('Normal Text. 1f389@2x.png Code: :tada:', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. ![1f389@2x.png](blob:https://new.expensify.com/123) Code: `:tada:`');
    });

    it('does not convert non-emoji codepoint image filenames to Unicode text', async () => {
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/456" alt="0200.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. 0200.png Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. ![0200.png](blob:https://new.expensify.com/456) Bold');
    });

    it('does not use the iOS Safari fallback in another browser', async () => {
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. ![1f389@2x.png](blob:https://new.expensify.com/123) Bold');
    });

    it('does not replace a normal iOS Safari blob image whose filename resembles an emoji', async () => {
        mockIsMobileSafari = true;
        const html = '<p>Long-press the image below and tap Copy:</p><img src="blob:https://example.com/normal-image" alt="1f4c4.png">';
        const event = createMockClipboardEvent('Long-press the image below and tap Copy:\n\n1f4c4.png', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Long-press the image below and tap Copy:\n![1f4c4.png](blob:https://example.com/normal-image)');
    });

    it('does not replace normal images whose alt text is an emoji shortcode', async () => {
        const html = '<p>Copy image below:</p><img src="https://example.com/image.png" alt=":smile:">';
        const event = createMockClipboardEvent('Copy image below:', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Copy image below:\n![:smile:](https://example.com/image.png)');
    });
});
