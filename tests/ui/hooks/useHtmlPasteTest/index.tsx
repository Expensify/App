import {act, renderHook} from '@testing-library/react-native';

import useHtmlPaste from '@hooks/useHtmlPaste';

import type * as Browser from '@libs/Browser';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {RefObject} from 'react';

import Onyx from 'react-native-onyx';

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
        // Given a Slack emoji image is followed by bold text, so changing the image must not remove the surrounding formatting.
        const html = '<p>Normal Text. <img data-stringify-emoji=":tada:" alt=":smile:" src="https://a.slack-edge.com/emoji.png"> <strong>Bold</strong></p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the Slack HTML is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the shortcode and bold Markdown remain because only the recognized emoji image should change.
        expect(textInputRef.current?.textContent).toBe('Normal Text. :tada: *Bold*');
    });

    it('preserves the original Safari formatting HTML when there are no emoji images', async () => {
        // Given Safari HTML has nested formatting and non-breaking spaces but no emoji images, so the emoji handling must leave it alone.
        const html =
            '<head><meta charset="UTF-8"></head><b style="font-weight: 700;">Bold text,<span class="Apple-converted-space">\u00A0</span></b><b style="font-weight: 700;"><i style="font-style: italic;">Bold and Italic text,<span class="Apple-converted-space">\u00A0</span></i></b><i style="font-style: italic;">Normal Italic text.</i>';
        const event = createMockClipboardEvent('Bold text,\u00A0Bold and Italic text,\u00A0Normal Italic text.', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the Safari HTML is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then its Markdown stays unchanged because parsing a paste without emoji images must not create a new formatting regression.
        expect(textInputRef.current?.textContent).toBe('*Bold text,**_Bold and Italic text,\u00A0_*_Normal Italic text._');
    });

    it('replaces a Slack emoji without changing surrounding Safari formatting HTML', async () => {
        // Given a Slack emoji appears beside Safari-specific formatting, so replacing the image must not serialize and alter the rest of the HTML.
        const html =
            '<head><meta charset="UTF-8"></head><img data-stringify-emoji=":tada:" alt=":tada:" src="https://a.slack-edge.com/emoji.png"> <b style="font-weight: 700;">Bold text,<span class="Apple-converted-space">\u00A0</span></b><i style="font-style: italic;">Italic text.</i>';
        const event = createMockClipboardEvent(':tada: Bold text,\u00A0Italic text.', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the mixed Slack and Safari HTML is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the emoji becomes a shortcode while the original formatting boundaries stay intact.
        expect(textInputRef.current?.textContent).toBe(':tada: *Bold text,*_Italic text._');
    });

    it('replaces only the recognized emoji when a normal image appears first', async () => {
        // Given a normal photo comes before a Slack emoji image, so Slack detection must not turn the photo into an emoji.
        const html = '<p><img src="https://example.com/photo.png" alt="Photo"> <img data-stringify-emoji=":tada:" alt=":tada:" src="https://a.slack-edge.com/emoji.png"></p>';
        const event = createMockClipboardEvent('Photo :tada:', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the mixed image HTML is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the photo remains Markdown image content and only the Slack emoji becomes a shortcode.
        expect(textInputRef.current?.textContent).toBe('![Photo](https://example.com/photo.png) :tada:');
    });

    it('falls back to image alt when only the emoji type metadata is available', async () => {
        // Given a legacy Slack emoji image has its type metadata but no explicit shortcode metadata, so the alt text is the only safe fallback.
        const html = '<p>Normal Text. <img data-stringify-type="emoji" alt=":tada:" src="https://a.slack-edge.com/emoji.png"> <strong>Bold</strong></p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the legacy Slack HTML is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the fallback shortcode is used because older clipboard data still needs to avoid broken image Markdown.
        expect(textInputRef.current?.textContent).toBe('Normal Text. :tada: *Bold*');
    });

    it('replaces an iOS Safari emoji image with its matched shortcode', async () => {
        // Given iOS Safari has removed Slack's metadata but kept a blob URL, emoji filename, and matching plain-text shortcode.
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the Safari clipboard payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the image becomes its matched shortcode because Safari's altered HTML must still paste as an emoji.
        expect(textInputRef.current?.textContent).toBe('Normal Text. :tada: Bold');
    });

    it('preserves matched iOS Safari shortcodes including skin tones', async () => {
        // Given Safari has several emoji images, including a skin-toned emoji, so each image must keep the exact matching Slack shortcode.
        mockIsMobileSafari = true;
        const html =
            '<p>Start <img src="blob:https://new.expensify.com/1" alt="1f389@2x.png"> <img src="blob:https://new.expensify.com/2" alt="1f44d-1f3fd@2x.png"> <img src="blob:https://new.expensify.com/3" alt="2764-fe0f@2x.png"> <strong>Bold</strong></p>';
        const event = createMockClipboardEvent('Start :tada: :+1::skin-tone-4: :heart: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the multi-emoji Safari payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then every matching shortcode is restored because one image must not be matched with another image's clipboard text.
        expect(textInputRef.current?.textContent).toBe('Start :tada: :+1::skin-tone-4: :heart: *Bold*');
    });

    it('validates an iOS Safari emoji against a supported Slack shortcode alias', async () => {
        // Given Safari's image filename represents a thumbs-up and plain text uses Slack's supported thumbs_up alias.
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f44d-1f3fd@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :thumbs_up::skin-tone-4: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the alias-based Safari payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the alias is preserved because a valid Slack alias should pass the same Unicode identity check as a canonical name.
        expect(textInputRef.current?.textContent).toBe('Normal Text. :thumbs_up::skin-tone-4: Bold');
    });

    it('replaces a valid iOS Safari emoji when a normal image appears first', async () => {
        // Given a normal photo appears before a valid Safari emoji image, so positional matching must account for both images.
        mockIsMobileSafari = true;
        const html = '<p>Start <img src="https://example.com/photo.png" alt="Photo"> <img src="blob:https://new.expensify.com/1" alt="1f389@2x.png"> End</p>';
        const event = createMockClipboardEvent('Start Photo :tada: End', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the mixed image Safari payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the photo stays an image and the later emoji becomes a shortcode because normal images must not block valid emoji conversion.
        expect(textInputRef.current?.textContent).toBe('Start ![Photo](https://example.com/photo.png) :tada: End');
    });

    it('replaces valid iOS Safari emojis beside an unsupported custom emoji', async () => {
        // Given an unsupported Slack custom emoji is next to a supported emoji, so failing the custom one must not reject the supported one.
        mockIsMobileSafari = true;
        const html = '<p>Start <img src="blob:https://new.expensify.com/custom" alt="thankyou_pink@2x.png"> <img src="blob:https://new.expensify.com/1" alt="1f389@2x.png"> End</p>';
        const event = createMockClipboardEvent('Start :thankyou_pink: :tada: End', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the Safari payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the unsupported image remains an image while the supported emoji becomes a shortcode.
        expect(textInputRef.current?.textContent).toBe('Start ![thankyou_pink@2x.png](blob:https://new.expensify.com/custom) :tada: End');
    });

    it('does not trust an unknown shortcode from a normal iOS Safari image', async () => {
        // Given a normal blob image sits beside a valid Safari emoji and plain text contains an unsupported shortcode, so plain text alone cannot identify an emoji image.
        mockIsMobileSafari = true;
        const html = '<p>Start <img src="blob:https://example.com/photo" alt=":thankyou_pink:"> <img src="blob:https://new.expensify.com/1" alt="1f389@2x.png"> End</p>';
        const event = createMockClipboardEvent('Start :thankyou_pink: :tada: End', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the Safari payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the normal image remains an image because an unknown shortcode must not turn arbitrary pasted content into an emoji.
        expect(textInputRef.current?.textContent).toBe('Start ![:thankyou_pink:](blob:https://example.com/photo) :tada: End');
    });

    it('does not convert an iOS Safari image when the shortcode at its position represents another emoji', async () => {
        // Given the Safari image filename represents party popper but its matching plain-text position says smile, so the two clipboard forms disagree.
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :smile: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the conflicting Safari payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the image remains unchanged because position alone is not enough to prove it is the same emoji.
        expect(textInputRef.current?.textContent).toBe('Normal Text. ![1f389@2x.png](blob:https://new.expensify.com/123) Bold');
    });

    it('does not use a shortcode elsewhere in iOS Safari plain text to validate an image', async () => {
        // Given the only matching shortcode is inside an inline code range, not at the image's position, so code text must not validate the image.
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Code: <code>:tada:</code></p>';
        const event = createMockClipboardEvent('Normal Text. 1f389@2x.png Code: :tada:', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the Safari payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the image remains unchanged and the code range survives because an unrelated shortcode must not trigger emoji conversion.
        expect(textInputRef.current?.textContent).toBe('Normal Text. ![1f389@2x.png](blob:https://new.expensify.com/123) Code: `:tada:`');
    });

    it('does not convert non-emoji codepoint image filenames to Unicode text', async () => {
        // Given a Safari blob image has a codepoint-shaped filename that is not an emoji, so the filename pattern alone cannot approve conversion.
        mockIsMobileSafari = true;
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/456" alt="0200.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. 0200.png Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the non-emoji image is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then it stays an image because converting arbitrary codepoints would corrupt normal pasted images.
        expect(textInputRef.current?.textContent).toBe('Normal Text. ![0200.png](blob:https://new.expensify.com/456) Bold');
    });

    it('does not use the iOS Safari fallback in another browser', async () => {
        // Given another browser provides a blob image with a Safari-looking emoji filename, so the Safari fallback must stay platform-specific.
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the non-Safari payload is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then it remains an image because other browsers do not prove that Safari removed Slack's metadata.
        expect(textInputRef.current?.textContent).toBe('Normal Text. ![1f389@2x.png](blob:https://new.expensify.com/123) Bold');
    });

    it('does not replace a normal iOS Safari blob image whose filename resembles an emoji', async () => {
        // Given a normal Safari blob image uses an emoji-shaped filename, so a real photo cannot be mistaken for an emoji just from its alt text.
        mockIsMobileSafari = true;
        const html = '<p>Long-press the image below and tap Copy:</p><img src="blob:https://example.com/normal-image" alt="1f4c4.png">';
        const event = createMockClipboardEvent('Long-press the image below and tap Copy:\n\n1f4c4.png', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the normal image is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then it stays an image because its plain text does not provide a matching supported Slack shortcode.
        expect(textInputRef.current?.textContent).toBe('Long-press the image below and tap Copy:\n![1f4c4.png](blob:https://example.com/normal-image)');
    });

    it('does not replace normal images whose alt text is an emoji shortcode', async () => {
        // Given a normal web image has an emoji-like alt value but no Slack metadata, so alt text alone must not classify it as a Slack emoji.
        const html = '<p>Copy image below:</p><img src="https://example.com/image.png" alt=":smile:">';
        const event = createMockClipboardEvent('Copy image below:', html);
        mockWindowSelection('');

        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the normal image is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then it stays an image because converting it would corrupt ordinary image pastes with emoji-looking alt text.
        expect(textInputRef.current?.textContent).toBe('Copy image below:\n![:smile:](https://example.com/image.png)');
    });
});

describe('useHtmlPaste - handlePastedHTML', () => {
    const MENTIONED_REPORT_ID = '1';
    const ROOM_NAME = '#general';
    const PASTED_HTML = `Hey <mention-report reportID="${MENTIONED_REPORT_ID}"/> team`;

    let textInputRef: RefObject<HTMLDivElement | null>;
    let textInputElement: HTMLDivElement;

    /** The HTML flavour of the clipboard, which is what Clipboard.setHtml writes when copying a message. */
    const createHtmlClipboardEvent = (html: string): Event => {
        const event = new Event('paste', {bubbles: true, cancelable: true});
        Object.defineProperty(event, 'clipboardData', {
            value: {
                getData: (type: string) => (type === 'text/html' ? html : ''),
                types: ['text/html'],
                files: [],
                items: [],
            },
        });
        return event;
    };

    const pasteHtmlIntoActiveInput = async (html: string) => {
        // @ts-expect-error -- this web test intentionally passes a contenteditable DOM ref to the shared hybrid hook.
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();
        await act(async () => {
            document.dispatchEvent(createHtmlClipboardEvent(html));
            await waitForBatchedUpdatesWithAct();
        });
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();

        textInputElement = document.createElement('div');
        textInputElement.setAttribute('contenteditable', 'true');
        textInputElement.textContent = '';
        document.body.appendChild(textInputElement);
        // The hook ignores a paste when the input is not focused, and a bare DOM node has no isFocused().
        Object.defineProperty(textInputElement, 'isFocused', {value: () => true, configurable: true});
        textInputRef = {current: textInputElement};

        const range = document.createRange();
        range.selectNodeContents(textInputElement);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    });

    afterEach(() => {
        document.body.removeChild(textInputElement);
    });

    it('resolves a pasted report mention to the room name', async () => {
        // Given the mentioned report is in Onyx, as it is when copying from a chat you can see
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${MENTIONED_REPORT_ID}`, {reportID: MENTIONED_REPORT_ID, reportName: ROOM_NAME} as Report);

        // When the HTML flavour of the clipboard is pasted into the input
        await pasteHtmlIntoActiveInput(PASTED_HTML);

        // Then the mention lands as the room name. Without the map ExpensiMark cannot resolve the
        // reportID and the user would silently paste "#Hidden" over a real mention.
        expect(textInputElement.textContent).toBe(`Hey ${ROOM_NAME} team`);
    });

    it('falls back to #Hidden when the mentioned report is not available', async () => {
        // Given a mention of a report the user has no access to, so it is absent from Onyx

        // When that HTML is pasted
        await pasteHtmlIntoActiveInput(PASTED_HTML);

        // Then ExpensiMark's own fallback shows, rather than leaking a raw reportID
        expect(textInputElement.textContent).toBe('Hey #Hidden team');
    });
});
