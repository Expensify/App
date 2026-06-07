import {act, renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import type {TextInput} from 'react-native';
import useHtmlPaste from '@hooks/useHtmlPaste';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

type UseHtmlPasteReturn = {
    handlePastePlainText?: (event: ClipboardEvent) => void;
};

jest.mock('@src/hooks/useHtmlPaste', (): typeof useHtmlPaste => {
    return jest.requireActual('@hooks/useHtmlPaste/index.ts');
});

describe('useHtmlPaste - handlePastePlainText', () => {
    let textInputRef: RefObject<(HTMLDivElement & Partial<TextInput>) | null>;

    const createMockClipboardEvent = (text: string, html = ''): ClipboardEvent => {
        const clipboardData = {
            getData: (type: string) => {
                if (type === 'text/html') {
                    return html;
                }
                return type === 'text/plain' ? text : '';
            },
            files: [] as unknown as FileList,
            items: [] as unknown as DataTransferItemList,
            types: html ? ['text/html', 'text/plain'] : ['text/plain'],
        };
        const event = new Event('paste', {bubbles: true, cancelable: true}) as ClipboardEvent;
        Object.defineProperty(event, 'clipboardData', {value: clipboardData});
        return event;
    };

    const mockWindowSelection = (selectedText: string) => {
        const range = document.createRange();
        range.selectNodeContents(textInputRef.current as Node);
        range.deleteContents();
        const textNode = document.createTextNode(selectedText);
        range.insertNode(textNode);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    beforeEach(() => {
        jest.clearAllMocks();

        const div = document.createElement('div');
        div.setAttribute('contenteditable', 'true');
        div.textContent = '';
        Object.defineProperty(div, 'isFocused', {value: () => true});
        document.body.appendChild(div);
        textInputRef = {current: div} as RefObject<HTMLDivElement & Partial<TextInput>>;

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
        document.body.removeChild(textInputRef.current as Node);
    });

    it('Paste URL with selection → produces Markdown link', async () => {
        const selectedText = 'Expensify';
        const url = 'https://expensify.com';
        const markdownLink = `[${selectedText}](${url})`;

        mockWindowSelection(selectedText);
        const event = createMockClipboardEvent(url);

        const {result} = renderHook<UseHtmlPasteReturn | void, void>(() => useHtmlPaste(textInputRef as unknown as RefObject<TextInput | (HTMLTextAreaElement & TextInput)>));
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result?.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputRef.current?.textContent).toBe(markdownLink);
        }
    });

    it('Paste URL without selection → raw URL', async () => {
        const url = 'https://example.com';
        mockWindowSelection('');
        const event = createMockClipboardEvent(url);

        const {result} = renderHook<UseHtmlPasteReturn | void, void>(() => useHtmlPaste(textInputRef as unknown as RefObject<TextInput | (HTMLTextAreaElement & TextInput)>));
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputRef.current?.textContent).toBe(url);
        }
    });

    it('Paste non-URL text → raw paste', async () => {
        const plainText = 'Hello World';
        mockWindowSelection('what up');
        const event = createMockClipboardEvent(plainText);

        const {result} = renderHook<UseHtmlPasteReturn | void, void>(() => useHtmlPaste(textInputRef as unknown as RefObject<TextInput | (HTMLTextAreaElement & TextInput)>));
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputRef.current?.textContent).toBe(plainText);
        }
    });

    it('should not trim trailing whitespace when pasting', async () => {
        const textWithTrailingWhitespace = 'Hello World   ';
        mockWindowSelection('');
        const event = createMockClipboardEvent(textWithTrailingWhitespace);

        const {result} = renderHook<UseHtmlPasteReturn | void, void>(() => useHtmlPaste(textInputRef as unknown as RefObject<TextInput | (HTMLTextAreaElement & TextInput)>));
        await waitForBatchedUpdatesWithAct();

        expect(result?.current).toBeDefined();

        if (result?.current) {
            const handlePastePlainText = result.current.handlePastePlainText;

            act(() => handlePastePlainText?.(event));

            expect(textInputRef.current?.textContent).toBe(textWithTrailingWhitespace);
            expect(textInputRef.current?.textContent?.endsWith('   ')).toBe(true);
        }
    });

    it('converts Slack emoji images to Unicode emoji while preserving surrounding HTML formatting', async () => {
        const html = '<p>Normal Text. <img data-stringify-emoji=":tada:" alt=":tada:" src="https://a.slack-edge.com/emoji.png"> <strong>Bold</strong></p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        renderHook(() => useHtmlPaste(textInputRef as unknown as RefObject<TextInput | (HTMLTextAreaElement & TextInput)>, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. 🎉 *Bold*');
    });

    it('converts iOS Safari blob emoji image filenames to Unicode emoji', async () => {
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        renderHook(() => useHtmlPaste(textInputRef as unknown as RefObject<TextInput | (HTMLTextAreaElement & TextInput)>, undefined, true));
        await waitForBatchedUpdatesWithAct();

        act(() => document.dispatchEvent(event));

        expect(textInputRef.current?.textContent).toBe('Normal Text. 🎉 Bold');
    });
});
