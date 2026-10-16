import {act, renderHook} from '@testing-library/react-native';

import useHtmlPaste from '@hooks/useHtmlPaste';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {RefObject} from 'react';
import type {TextInput} from 'react-native';

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
    let textInputRef: RefObject<(HTMLDivElement & Pick<TextInput, 'isFocused'>) | null>;
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
        textInputRef = {current: Object.assign(textInputElement, {isFocused: () => true})};

        if (!Range.prototype.getBoundingClientRect) {
            Range.prototype.getBoundingClientRect = () => ({
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                right: 0,
                bottom: 0,
                x: 0,
                y: 0,
                toJSON: () => {},
            });
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
});

describe('useHtmlPaste - handlePastedHTML', () => {
    const MENTIONED_REPORT_ID = '1';
    const ROOM_NAME = '#general';
    const PASTED_HTML = `Hey <mention-report reportID="${MENTIONED_REPORT_ID}"/> team`;

    let textInputRef: RefObject<(HTMLDivElement & Pick<TextInput, 'isFocused'>) | null>;
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
        const nativeInput = createMock<TextInput>({isFocused: () => true});
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
