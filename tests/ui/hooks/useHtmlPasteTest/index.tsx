import {act, renderHook} from '@testing-library/react-native';

import useHtmlPaste from '@hooks/useHtmlPaste';

import type {RefObject} from 'react';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

type UseHtmlPasteReturn = {
    handlePastePlainText?: (event: ClipboardEvent) => void;
};

jest.mock('@src/hooks/useHtmlPaste', (): typeof useHtmlPaste => {
    return jest.requireActual('@hooks/useHtmlPaste/index.ts');
});

describe('useHtmlPaste - handlePastePlainText', () => {
    let textInputRef: RefObject<HTMLDivElement | null>;
    let textInputElement: HTMLDivElement;

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

    const mockWindowSelection = (selectedText: string, textBeforeSelection = '', textAfterSelection = '') => {
        const inputValue = `${textBeforeSelection}${selectedText}${textAfterSelection}`;
        const textNode = document.createTextNode(inputValue);
        textInputRef.current?.replaceChildren(textNode);

        const range = document.createRange();
        range.setStart(textNode, textBeforeSelection.length);
        range.setEnd(textNode, textBeforeSelection.length + selectedText.length);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    const mockWindowSelectionBetweenTextNodes = (textBeforeSelection: string, textAfterSelection: string) => {
        const beforeNode = document.createTextNode(textBeforeSelection);
        const afterNode = document.createTextNode(textAfterSelection);
        const beforeSpan = document.createElement('span');
        const afterSpan = document.createElement('span');
        beforeSpan.appendChild(beforeNode);
        afterSpan.appendChild(afterNode);
        textInputRef.current?.replaceChildren(beforeSpan, afterSpan);

        const range = document.createRange();
        range.setStart(beforeNode, textBeforeSelection.length);
        range.collapse(true);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    const renderUseHtmlPaste = (isActive = false, shouldConvertPlainTextEmojiShortcodes = false) =>
        renderHook<UseHtmlPasteReturn | void, void>(() =>
            useHtmlPaste(
                // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
                textInputRef,
                undefined,
                isActive,
                undefined,
                undefined,
                shouldConvertPlainTextEmojiShortcodes,
            ),
        );

    beforeEach(() => {
        jest.clearAllMocks();

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

        const {result} = renderUseHtmlPaste();
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

        const {result} = renderUseHtmlPaste();
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

        const {result} = renderUseHtmlPaste();
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputElement.textContent).toBe(plainText);
        }
    });

    it('does not convert plain-text emoji shortcodes by default', async () => {
        const plainText = 'Hello :smile:';
        mockWindowSelection('');
        const event = createMockClipboardEvent(plainText);

        const {result} = renderUseHtmlPaste();
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputRef.current?.textContent).toBe(plainText);
        }
    });

    it('converts plain-text emoji shortcodes when enabled', async () => {
        mockWindowSelection('');
        const event = createMockClipboardEvent('Hello :smile:');

        const {result} = renderUseHtmlPaste(false, true);
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputRef.current?.textContent).toBe('Hello 😄 ');
        }
    });

    it('does not add another separator when text after the paste starts with whitespace', async () => {
        mockWindowSelectionBetweenTextNodes('Hello ', ' world');
        const event = createMockClipboardEvent(':smile:');

        const {result} = renderUseHtmlPaste(false, true);
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputRef.current?.textContent).toBe('Hello 😄 world');
        }
    });

    it('adds a separator when text after the paste starts with a letter', async () => {
        mockWindowSelection('', 'Hello ', 'world');
        const event = createMockClipboardEvent(':smile:');

        const {result} = renderUseHtmlPaste(false, true);
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputRef.current?.textContent).toBe('Hello 😄 world');
        }
    });

    it('should not trim trailing whitespace when pasting', async () => {
        const textWithTrailingWhitespace = 'Hello World   ';
        mockWindowSelection('');
        const event = createMockClipboardEvent(textWithTrailingWhitespace);

        const {result} = renderUseHtmlPaste();
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputElement.textContent).toBe(textWithTrailingWhitespace);
            expect(textInputElement.textContent?.endsWith('   ')).toBe(true);
        }
    });

    it('converts Slack emoji images to Unicode emoji by default while preserving surrounding HTML formatting', async () => {
        const html = '<p>Normal Text. <img data-stringify-emoji=":tada:" alt=":tada:" src="https://a.slack-edge.com/emoji.png"> <strong>Bold</strong></p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        renderUseHtmlPaste(true);
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. 🎉 *Bold*');
    });

    it('converts Slack emoji images in shared markdown inputs without enabling plain-text shortcode conversion', async () => {
        const html = '<p>Normal Text. <img data-stringify-emoji=":tada:" alt=":tada:" src="https://a.slack-edge.com/emoji.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        renderUseHtmlPaste(true);
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. 🎉 Bold');
    });

    it('converts iOS Safari blob emoji image filenames to Unicode emoji', async () => {
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        renderUseHtmlPaste(true);
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. 🎉 Bold');
    });

    it('does not convert non-emoji codepoint image filenames to Unicode text', async () => {
        const html = '<p>Normal Text. <img src="https://example.com/image.png" alt="0200.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. 0200.png Bold', html);
        mockWindowSelection('');

        renderUseHtmlPaste(true);
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. ![0200.png](https://example.com/image.png) Bold');
    });

    it('does not replace normal images whose alt text is an emoji shortcode', async () => {
        const html = '<p>Copy image below:</p><img src="https://example.com/image.png" alt=":smile:">';
        const event = createMockClipboardEvent('Copy image below:', html);
        mockWindowSelection('');

        renderUseHtmlPaste(true);
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Copy image below:\n![:smile:](https://example.com/image.png)');
    });
});
