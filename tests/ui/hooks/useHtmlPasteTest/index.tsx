import {act, renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import type {TextInput} from 'react-native';
import useHtmlPaste, {replaceEmojiImagesWithAltText} from '@hooks/useHtmlPaste';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

type UseHtmlPasteReturn = {
    handlePastePlainText?: (event: ClipboardEvent) => void;
};

jest.mock('@src/hooks/useHtmlPaste', (): typeof useHtmlPaste => {
    return jest.requireActual('@hooks/useHtmlPaste/index.ts');
});

describe('useHtmlPaste - handlePastePlainText', () => {
    let textInputRef: RefObject<(HTMLDivElement & Partial<TextInput>) | null>;

    const createMockClipboardEvent = (text: string): ClipboardEvent => {
        const clipboardData = {
            getData: (type: string) => (type === 'text/plain' ? text : ''),
            files: [] as unknown as FileList,
            items: [] as unknown as DataTransferItemList,
            types: ['text/plain'],
        };
        return {
            clipboardData,
            preventDefault: jest.fn(),
        } as unknown as ClipboardEvent;
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
});

describe('replaceEmojiImagesWithAltText', () => {
    it('should replace Slack emoji images (data-stringify-type="emoji") with alt text', () => {
        const htmlWithSlackEmoji = '<p>Hello <img src="https://emoji.slack-edge.com/emoji.png" alt="😊" data-stringify-type="emoji"> world</p>';
        const result = replaceEmojiImagesWithAltText(htmlWithSlackEmoji);
        expect(result).toBe('<p>Hello 😊 world</p>');
    });

    it('should replace emoji images with data-stringify-emoji attribute', () => {
        const htmlWithEmoji = '<p>Test <img src="https://example.com/emoji.png" alt="🎉" data-stringify-emoji=":tada:"> message</p>';
        const result = replaceEmojiImagesWithAltText(htmlWithEmoji);
        expect(result).toBe('<p>Test 🎉 message</p>');
    });

    it('should replace multiple emoji images in the same HTML', () => {
        const htmlWithMultipleEmojis = '<p>Hello <img src="url1" alt="😊" data-stringify-type="emoji"><img src="url2" alt="🎉" data-stringify-type="emoji"> there</p>';
        const result = replaceEmojiImagesWithAltText(htmlWithMultipleEmojis);
        expect(result).toBe('<p>Hello 😊🎉 there</p>');
    });

    it('should preserve regular images (not emoji)', () => {
        const htmlWithRegularImage = '<p>Hello <img src="https://example.com/photo.jpg" alt="A photo"> world</p>';
        const result = replaceEmojiImagesWithAltText(htmlWithRegularImage);
        expect(result).toBe('<p>Hello <img src="https://example.com/photo.jpg" alt="A photo"> world</p>');
    });

    it('should handle mixed content with emoji and regular images', () => {
        const htmlWithMixedImages = '<p>Look at this <img src="photo.jpg" alt="photo"> and <img src="emoji.png" alt="😊" data-stringify-type="emoji"> emoji</p>';
        const result = replaceEmojiImagesWithAltText(htmlWithMixedImages);
        expect(result).toBe('<p>Look at this <img src="photo.jpg" alt="photo"> and 😊 emoji</p>');
    });

    it('should preserve HTML formatting when replacing emojis', () => {
        const htmlWithFormatting = '<p><strong>Bold</strong> <img src="url" alt="😊" data-stringify-type="emoji"> <em>italic</em></p>';
        const result = replaceEmojiImagesWithAltText(htmlWithFormatting);
        expect(result).toBe('<p><strong>Bold</strong> 😊 <em>italic</em></p>');
    });

    it('should handle emoji images without alt text by keeping them unchanged', () => {
        const htmlWithNoAlt = '<p>Test <img src="url" data-stringify-type="emoji"> message</p>';
        const result = replaceEmojiImagesWithAltText(htmlWithNoAlt);
        // Image without alt should remain unchanged
        expect(result).toBe('<p>Test <img src="url" data-stringify-type="emoji"> message</p>');
    });

    it('should return original HTML if no images are present', () => {
        const htmlWithoutImages = '<p>Hello world</p>';
        const result = replaceEmojiImagesWithAltText(htmlWithoutImages);
        expect(result).toBe('<p>Hello world</p>');
    });
});
