import {act, renderHook} from '@testing-library/react-native';

import useHtmlPaste from '@hooks/useHtmlPaste';

import Parser from '@libs/Parser';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {ComponentRef, RefObject} from 'react';
import type {TextInput} from 'react-native';

import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

type UseHtmlPasteReturn = {
    handlePastePlainText?: (event: ClipboardEvent) => void;
};

// Reduced tags from the captured desktop pastes, without private message content.
const emojiImageCases = [
    {
        source: 'Gmail',
        html: '<img data-emoji="😅" class="an1" alt="😅" src="https://fonts.gstatic.com/s/e/notoemoji/17.0/1f605/32.png">',
        replacement: '😅',
    },
    {
        source: 'Discord message selection',
        html: '<img class="emoji" data-type="emoji" data-name=":smile:" alt="😄" src="https://discord.com/assets/58a76b2430663605.svg">',
        replacement: '😄',
    },
    {
        source: 'Facebook and Messenger',
        html: '<img alt="🤓" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t52/2/16/1f913.png">',
        replacement: '🤓',
    },
    {
        source: 'Instagram direct messages',
        html: '<img alt="😄" src="https://static.cdninstagram.com/images/emoji.php/v9/t71/2/16/1f604.png">',
        replacement: '😄',
    },
    {
        source: 'Teams',
        html: '<img itemtype="http://schema.skype.com/Emoji" itemid="1f440_eyes" alt="👀" src="https://tflteams.public.onecdn.static.microsoft/evergreen-assets/personal-expressions/v2/assets/emoticons/1f440_eyes/default/30_f.png?v=v10">',
        replacement: '👀',
    },
    {
        source: 'YouTube comments',
        html: '<img class="ytAttributedStringImageElement" alt="💪" src="https://www.youtube.com/s/gaming/emoji/7ff574f2/emoji_u1f4aa.png">',
        replacement: '💪',
    },
    {
        source: 'Discourse message selection',
        html: '<img src="https://emoji.discourse-cdn.com/twitter/grinning_face_with_smiling_eyes.png?v=16" title=":grinning_face_with_smiling_eyes:" class="emoji" alt=":grinning_face_with_smiling_eyes:">',
        replacement: ':grinning_face_with_smiling_eyes:',
    },
];

jest.mock('@src/hooks/useHtmlPaste', (): typeof useHtmlPaste => {
    return jest.requireActual('@hooks/useHtmlPaste/index.ts');
});

const originalRangeGeometryDescriptor = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect');
let didInstallRangeGeometry = false;

beforeAll(() => {
    if (typeof Range.prototype.getBoundingClientRect === 'function') {
        return;
    }

    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
        configurable: true,
        writable: true,
        value: (): DOMRect => ({
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            right: 0,
            bottom: 0,
            x: 0,
            y: 0,
            toJSON: () => {},
        }),
    });
    didInstallRangeGeometry = true;
});

afterAll(() => {
    if (!didInstallRangeGeometry) {
        return;
    }

    if (originalRangeGeometryDescriptor) {
        Object.defineProperty(Range.prototype, 'getBoundingClientRect', originalRangeGeometryDescriptor);
    } else {
        Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
    }
});

describe('useHtmlPaste - handlePastePlainText', () => {
    let textInputRef: RefObject<(HTMLDivElement & Pick<ComponentRef<typeof TextInput>, 'isFocused'>) | null>;
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

        textInputElement = document.createElement('div');
        textInputElement.setAttribute('contenteditable', 'true');
        textInputElement.textContent = '';
        document.body.appendChild(textInputElement);
        textInputRef = {current: Object.assign(textInputElement, {isFocused: () => true})};
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

        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the Slack HTML is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the shortcode and bold Markdown remain because only the recognized emoji image should change.
        expect(textInputRef.current?.textContent).toBe('Normal Text. :tada: *Bold*');
    });

    it('preserves multiple Slack emoji shortcodes, spacing, and surrounding formatting', async () => {
        // Given Slack HTML mixes supported and custom emoji images with formatting, so removing the Safari fallback must preserve the desktop paste behavior.
        const html =
            '<p><img data-stringify-emoji=":tada:" alt=":tada:" src="https://a.slack-edge.com/tada.png"> <img data-stringify-emoji=":thankyou_pink:" alt=":thankyou_pink:" src="https://a.slack-edge.com/custom.png"><img data-stringify-emoji=":smile:" alt=":smile:" src="https://a.slack-edge.com/smile.png"> <strong>Bold</strong> <em>Italic</em> <a href="https://example.com">Link</a> <code>:smile:</code></p><pre>:tada:</pre>';
        const event = createMockClipboardEvent(':tada: :thankyou_pink::smile: Bold Italic Link :smile:\n:tada:', html);
        mockWindowSelection('');

        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the complete Slack message is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then every emoji image becomes its exact shortcode and the existing spacing and Markdown survive for the Composer pipeline to process.
        expect(textInputRef.current?.textContent).toBe(':tada: :thankyou_pink::smile: *Bold* _Italic_ [Link](https://example.com) `:smile:`\n```\n:tada:\n```');
    });

    it.each(emojiImageCases)('uses the emoji text supplied by $source without losing surrounding formatting', async ({html, replacement}) => {
        // Given captured emoji HTML includes formatting that must not be traded for a plain-text paste.
        const event = createMockClipboardEvent(
            'Hello Bold Italic Link :smile:',
            `<p>Hello ${html} <b>Bold</b> <i>Italic</i> <a href="https://example.com">Link</a> <code>:smile:</code></p><pre>:tada:</pre>`,
        );
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the HTML is pasted, its emoji must survive even though text/plain omits it, as in the Teams capture.
        act(() => document.dispatchEvent(event));

        // Then the source text replaces the image while the existing parser retains formatting and code content.
        expect(textInputElement.textContent).toBe(`Hello ${replacement} *Bold* _Italic_ [Link](https://example.com) \`:smile:\`\n\`\`\`\n:tada:\n\`\`\``);
    });

    it.each([
        ['Gmail value instead of conflicting alt', '<img data-emoji="😅" alt="😄" src="https://example.com/asset.png">', '😅'],
        ['Discord alt instead of conflicting shortcode', '<img data-type="emoji" data-name=":tada:" alt="😄">', '😄'],
        ['Discord alt with an unsupported shortcode', '<img data-type="emoji" data-name=":source_specific_name:" alt="😄">', '😄'],
        ['Discord dark waving hand', '<img data-type="emoji" data-name=":wave_tone5:" alt="👋🏿">', '👋🏿'],
        ['Discord dark right-facing fist', '<img data-type="emoji" data-name=":right_facing_fist_tone5:" alt="🤜🏿">', '🤜🏿'],
        ['Discord empty alt fallback', '<img data-type="emoji" data-name=":smile:" alt="">', ':smile:'],
        ['Gmail empty metadata fallback', '<img data-emoji="" alt="😅">', '😅'],
        ['Discord missing name fallback', '<img data-type="emoji" alt="😄">', '😄'],
    ])('uses the expected emoji text for %s', async (_name, html, replacement) => {
        // Given explicit emoji fields identify the image independently of its URL or the App's supported names.
        const event = createMockClipboardEvent('', html);
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When that image is pasted through the same path used for Slack metadata.
        act(() => document.dispatchEvent(event));

        // Then Discord uses its complete alt, while other metadata and missing-alt fallbacks retain their values.
        expect(textInputElement.textContent).toBe(replacement);
    });

    it.each([
        ['clap', '2', '👏🏻'],
        ['clap', '3', '👏🏼'],
        ['clap', '4', '👏🏽'],
        ['clap', '5', '👏🏾'],
        ['clap', '6', '👏🏿'],
        ['rightwards_pushing_hand', '6', '🫸🏿'],
        ['palms_up_together', '6', '🤲🏿'],
        ['folded_hands', '2', ':folded_hands:t2:'],
        ['hand_with_index_finger_and_thumb_crossed', '2', '🫰🏻'],
        ['sign_of_the_horns', '2', ':sign_of_the_horns:t2:'],
        ['source_specific_name', '6', ':source_specific_name:t6:'],
        ['smile', '6', ':smile:t6:'],
    ])('preserves the Discourse tone or its unsupported shortcode for %s/t%s', async (name, tone, replacement) => {
        // Given a Discourse image encodes its tone in the URL, alt and title, unlike its unchanged literal shortcode.
        const alt = `:${name}:t${tone}:`;
        const html = `<p><b>Before</b> <img class="emoji" src="https://emoji.discourse-cdn.com/twitter/${name}/${tone}.png?v=16" alt="${alt}" title="${alt}"> ${alt} <i>After</i></p>`;
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the image is pasted beside formatted text and a literal shortcode.
        act(() => document.dispatchEvent(createMockClipboardEvent('', html)));

        // Then the image becomes a supported toned variant or its full original shortcode, without dropping the tone.
        expect(textInputElement.textContent).toBe(`*Before* ${replacement} ${alt} _After_`);
    });

    it.each(['grinning_face_with_smiling_eyes', 'kissing_face', 'source_specific_name'])('keeps the Discourse shortcode %s unchanged', async (name) => {
        // Given a Discourse image and literal text use the same name, whether or not the App recognizes it.
        const html = `<p>:${name}: <img class="emoji" src="https://emoji.discourse-cdn.com/twitter/${name}.png?v=16" title=":${name}:" alt=":${name}:"></p>`;
        const event = createMockClipboardEvent('', html);
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When only the image tag is replaced before Markdown parsing.
        act(() => document.dispatchEvent(event));

        // Then neither shortcode is renamed; supporting the source's names is not this hook's responsibility.
        expect(textInputElement.textContent).toBe(`:${name}: :${name}:`);
    });

    it.each(['❤', '❤️', '👩🏽‍💻', '🇮🇳', '1️⃣'])('keeps the supplied Unicode sequence %s unchanged', async (emoji) => {
        // Given data-emoji already contains the text, selectors, joiners, and existing tones need no conversion.
        const event = createMockClipboardEvent('', `<img data-emoji="${emoji}" alt="${emoji}">`);
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the image is replaced using its metadata rather than decoding a filename.
        act(() => document.dispatchEvent(event));

        // Then the complete original sequence is retained instead of reconstructed or normalized.
        expect(textInputElement.textContent).toBe(emoji);
    });

    it.each([
        ['ordinary photo with emoji alt', '<img src="https://example.com/photo.png" alt="😄">'],
        ['unrelated dataset field', '<img data-name=":smile:" src="https://example.com/photo.png" alt="😄">'],
        ['Discord asset without emoji metadata', '<img src="https://discord.com/assets/58a76b2430663605.svg" alt="😄">'],
        ['Gmail asset without emoji metadata', '<img src="https://fonts.gstatic.com/s/e/notoemoji/17.0/1f605/32.png" alt="😅">'],
        ['YouTube custom image', '<img src="https://yt3.ggpht.com/custom-emoji" alt="🎉">'],
        ['misleading hostname', '<img src="https://static.xx.fbcdn.net.example.com/images/emoji.php/v9/t52/2/16/1f913.png" alt="🤓">'],
        ['ordinary Meta image', '<img src="https://static.xx.fbcdn.net/photo.png" alt="🤓">'],
        ['Teams type on an unrelated image', '<img itemtype="http://schema.skype.com/Emoji" itemid="eyes" src="https://example.com/photo.png" alt="👀">'],
        ['Discourse class on an unrelated image', '<img class="emoji" src="https://example.com/photo.png" title=":smile:" alt=":smile:">'],
        ['invalid Discourse tone', '<img class="emoji" src="https://emoji.discourse-cdn.com/twitter/clap/7.png" title=":clap:t7:" alt=":clap:t7:">'],
    ])('leaves existing image handling unchanged for %s', async (_name, html) => {
        // Given an image has neither recognized emoji metadata nor a matching emoji asset URL.
        const expected = Parser.htmlToMarkdown(html);
        const event = createMockClipboardEvent('unrelated plain text', html);
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When it passes through the emoji recognition used for the captured applications.
        act(() => document.dispatchEvent(event));

        // Then alt text alone cannot change the existing treatment of an ordinary or unrecognized image.
        expect(textInputElement.textContent).toBe(expected);
    });

    it('preserves adjacent emojis, spaces, and line breaks across repeated pastes', async () => {
        // Given adjacent YouTube emoji images have no spaces between them, but surrounding text does.
        const image = '<img alt="🎉" src="https://www.youtube.com/s/gaming/emoji/7ff574f2/emoji_u1f389.png">';
        const html = `<p>Start ${image}${image} ${image}<br>End</p>`;
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the same content is pasted twice at the advancing caret.
        act(() => document.dispatchEvent(createMockClipboardEvent('', html)));
        act(() => document.dispatchEvent(createMockClipboardEvent('', html)));

        // Then image replacement adds no padding and uses no stale positions from the previous paste.
        expect(textInputElement.textContent).toBe('Start 🎉🎉 🎉\nEndStart 🎉🎉 🎉\nEnd');
    });

    it('preserves ordinary images and original formatting around mixed emoji formats', async () => {
        // Given ordinary images surround Slack and Gmail emojis beside existing non-breaking-space formatting.
        const html =
            '<img src="https://example.com/before.png" alt="Before"> <img data-stringify-emoji=":tada:" src="https://a.slack-edge.com/tada.png"> <img data-emoji="😄" alt="😄"> <b>Bold<span class="Apple-converted-space">\u00A0</span></b><i>Italic</i> <img src="https://example.com/after.png" alt="After">';
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When both emoji images are replaced using the existing source positions.
        act(() => document.dispatchEvent(createMockClipboardEvent('', html)));

        // Then ordinary images and formatting boundaries retain their existing parser output.
        expect(textInputElement.textContent).toBe('![Before](https://example.com/before.png) :tada: 😄 *Bold*_Italic_ ![After](https://example.com/after.png)');
    });

    it.each([
        ['Discord Copy Text', '**Bold** 😄🎉\n:smile:'],
        ['Discourse Copy Text', ':grinning_face_with_smiling_eyes: :source_specific_name:'],
    ])('keeps %s on the existing plain-text path', async (_source, text) => {
        // Given a source's Copy button supplies plain text with no image tags to recover.
        mockWindowSelection('');
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the copy-button value is pasted without HTML.
        act(() => document.dispatchEvent(createMockClipboardEvent(text)));

        // Then the hook adds neither name translation nor shortcode-to-Unicode conversion.
        expect(textInputElement.textContent).toBe(text);
    });

    it('preserves the original Safari formatting HTML when there are no emoji images', async () => {
        // Given Safari HTML has nested formatting and non-breaking spaces but no emoji images, so the emoji handling must leave it alone.
        const html =
            '<head><meta charset="UTF-8"></head><b style="font-weight: 700;">Bold text,<span class="Apple-converted-space">\u00A0</span></b><b style="font-weight: 700;"><i style="font-style: italic;">Bold and Italic text,<span class="Apple-converted-space">\u00A0</span></i></b><i style="font-style: italic;">Normal Italic text.</i>';
        const event = createMockClipboardEvent('Bold text,\u00A0Bold and Italic text,\u00A0Normal Italic text.', html);
        mockWindowSelection('');

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

        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the legacy Slack HTML is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then the fallback shortcode is used because older clipboard data still needs to avoid broken image Markdown.
        expect(textInputRef.current?.textContent).toBe('Normal Text. :tada: *Bold*');
    });

    it('does not replace blob images without Slack emoji metadata', async () => {
        // Given a blob image has an emoji-shaped filename but no Slack metadata, so its filename must not classify it as an emoji.
        const html = '<p>Normal Text. <img src="blob:https://new.expensify.com/123" alt="1f389@2x.png"> Bold</p>';
        const event = createMockClipboardEvent('Normal Text. :tada: Bold', html);
        mockWindowSelection('');

        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        await waitForBatchedUpdatesWithAct();

        // When the blob image is pasted into the active composer.
        act(() => document.dispatchEvent(event));

        // Then it remains an image because neither the blob URL nor the emoji-shaped alt proves it is a Slack emoji.
        expect(textInputRef.current?.textContent).toBe('Normal Text. ![1f389@2x.png](blob:https://new.expensify.com/123) Bold');
    });

    it('does not replace normal images whose alt text is an emoji shortcode', async () => {
        // Given a normal web image has an emoji-like alt value but no Slack metadata, so alt text alone must not classify it as a Slack emoji.
        const html = '<p>Copy image below:</p><img src="https://example.com/image.png" alt=":smile:">';
        const event = createMockClipboardEvent('Copy image below:', html);
        mockWindowSelection('');

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

    let textInputRef: RefObject<(HTMLDivElement & Pick<ComponentRef<typeof TextInput>, 'isFocused'>) | null>;
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
        textInputRef = {current: Object.assign(textInputElement, {isFocused: () => true})};

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
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${MENTIONED_REPORT_ID}`, {reportID: MENTIONED_REPORT_ID, reportName: ROOM_NAME} satisfies Report);

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

describe('useHtmlPaste DOM insertion boundaries', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        document.body.replaceChildren();
    });

    it('uses the same source text in non-Composer fields without converting shortcodes', async () => {
        // Given another input shares this hook but must not gain a separate emoji conversion pipeline.
        const input = Object.assign(document.createElement('textarea'), {isFocused: () => true});
        window.getSelection()?.removeAllRanges();
        jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
        renderHook(() => useHtmlPaste({current: input}, undefined, true));
        await waitForBatchedUpdatesWithAct();
        const html =
            '<p><img data-emoji="😄" alt="😄"> <img data-type="emoji" data-name=":wave_tone5:" alt="👋🏿"> <img class="emoji" src="https://emoji.discourse-cdn.com/twitter/kissing_face.png" title=":kissing_face:" alt=":kissing_face:"> <img class="emoji" src="https://emoji.discourse-cdn.com/twitter/clap/6.png" title=":clap:t6:" alt=":clap:t6:"> :clap:t6: :tada:</p>';
        const event = Object.assign(new Event('paste', {bubbles: true, cancelable: true}), {
            clipboardData: createMock<DataTransfer>({types: ['text/html'], getData: () => html}),
        });

        // When images with Unicode and shortcode metadata are pasted alongside a literal shortcode.
        act(() => document.dispatchEvent(event));

        // Then image tones are retained without adding conversion of any literal shortcode in this input.
        expect(input.value).toBe('😄 👋🏿 :kissing_face: 👏🏿 :clap:t6: :tada:');
    });

    it.each(['input', 'textarea'] as const)('uses %s setRangeText with the existing length arithmetic and focusin dispatch', (tagName) => {
        // Given the actual RN Web host category, augmented with its isFocused command.
        const input = Object.assign(document.createElement(tagName), {isFocused: () => true});
        input.value = 'abcd';
        input.setSelectionRange(1, 3);
        const focusIn = jest.fn();
        input.addEventListener('focusin', focusIn);
        const setRangeText = jest.spyOn(input, 'setRangeText');
        const frames = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
        window.getSelection()?.removeAllRanges();
        const {result} = renderHook(() => useHtmlPaste({current: input}, undefined, false, 6));
        const paste = result.current?.handlePastePlainText;
        if (!paste) {
            throw new Error('Expected plaintext paste interface');
        }
        const event = createMock<ClipboardEvent>({clipboardData: {getData: () => 'WORD'}});

        // When a long paste replaces the selected span.
        act(() => paste(event));

        // Then truncation uses the pre-existing whole-value length and retains focus/scroll scheduling.
        expect(setRangeText).toHaveBeenCalledWith('WO');
        expect(input.value).toBe('aWOd');
        expect(focusIn).toHaveBeenCalledTimes(1);
        expect(frames).toHaveBeenCalledTimes(1);
    });

    it('inserts a contenteditable Range, retains the caret, dispatches input and scrolls on the scheduled frame', () => {
        // Given the markdown div producer with a real selection and overflow geometry.
        const input = Object.assign(document.createElement('div'), {isFocused: () => true});
        input.setAttribute('contenteditable', 'true');
        input.textContent = 'ab';
        document.body.appendChild(input);
        const range = document.createRange();
        range.selectNodeContents(input);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        Object.defineProperties(input, {clientWidth: {value: 20}, clientHeight: {value: 20}});
        jest.spyOn(input, 'getBoundingClientRect').mockReturnValue(createMock<DOMRect>({left: 0, top: 0}));
        jest.spyOn(Range.prototype, 'getBoundingClientRect').mockReturnValue(createMock<DOMRect>({left: 100, top: 200}));
        const frames = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
        const inputEvent = jest.fn();
        const focusIn = jest.fn();
        input.addEventListener('input', inputEvent);
        input.addEventListener('focusin', focusIn);
        const {result} = renderHook(() => useHtmlPaste({current: input}, undefined, false, 5));
        const paste = result.current?.handlePastePlainText;
        if (!paste) {
            throw new Error('Expected plaintext paste interface');
        }

        // When only three characters fit in the div's current length budget.
        act(() => paste(createMock<ClipboardEvent>({clipboardData: {getData: () => 'WORD'}})));
        const frame = frames.mock.calls.at(0);
        if (!frame) {
            throw new Error('Expected scheduled caret scroll');
        }
        act(() => frame[0](0));

        // Then Range insertion and collapsed caret precede the browser scrolling/focus notifications.
        expect(input.textContent).toBe('abWOR');
        expect(selection?.anchorOffset).toBe(3);
        expect(selection?.isCollapsed).toBe(true);
        expect(inputEvent).toHaveBeenCalledTimes(1);
        expect(focusIn).toHaveBeenCalledTimes(1);
        expect(input.scrollLeft).toBe(90);
        expect(input.scrollTop).toBe(190);
    });

    it('does not attempt DOM insertion for absent, native or non-editable div refs', () => {
        // Given a native partial provides focus but does not have DOM identity.
        const nativeInput = createMock<ComponentRef<typeof TextInput>>({isFocused: () => true});
        const input = Object.assign(document.createElement('div'), {isFocused: () => true});
        const frames = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
        const ref: Parameters<typeof useHtmlPaste>[0] = {current: null};
        const {result} = renderHook(() => useHtmlPaste(ref));
        const paste = result.current?.handlePastePlainText;
        if (!paste) {
            throw new Error('Expected plaintext paste interface');
        }
        const event = createMock<ClipboardEvent>({clipboardData: {getData: () => 'hello'}});

        // When each category reaches the existing insertion boundary.
        act(() => paste(event));
        ref.current = nativeInput;
        act(() => paste(event));
        ref.current = input;
        act(() => paste(event));

        // Then no browser mutation or scheduled scroll is attempted.
        expect(input.textContent).toBe('');
        expect(frames).not.toHaveBeenCalled();
    });
});
