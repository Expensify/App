import {act, renderHook} from '@testing-library/react-native';

import useHtmlPaste from '@hooks/useHtmlPaste';

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

describe('useHtmlPaste - handlePastePlainText', () => {
    let textInputRef: RefObject<HTMLDivElement | null>;
    let textInputElement: HTMLDivElement;

    const createMockClipboardEvent = (text: string): ClipboardEvent => {
        return createMock<ClipboardEvent>({
            clipboardData: {
                getData: (type: string) => (type === 'text/plain' ? text : ''),
                files: [],
                items: [],
                types: ['text/plain'],
            },
            preventDefault: jest.fn(),
        });
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
