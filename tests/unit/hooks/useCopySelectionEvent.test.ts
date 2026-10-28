import {renderHook} from '@testing-library/react-native';

import useCopySelectionEvent from '@hooks/useCopySelectionEvent';

import getClipboardText from '@libs/Clipboard/getClipboardText';
import SelectionScraper from '@libs/SelectionScraper';

jest.mock('@libs/Clipboard/getClipboardText', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/SelectionScraper', () => ({
    __esModule: true,
    default: {
        getCurrentSelection: jest.fn(),
    },
}));

const mockGetClipboardText = jest.mocked(getClipboardText);
const mockGetCurrentSelection = jest.mocked(SelectionScraper.getCurrentSelection);

describe('useCopySelectionEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.getSelection()?.removeAllRanges();
    });

    const dispatchCopyEvent = (target: Document | HTMLElement = document) => {
        const clipboardData = {
            clearData: jest.fn(),
            setData: jest.fn(),
        };
        const event = new Event('copy', {bubbles: true, cancelable: true});
        Object.defineProperty(event, 'clipboardData', {value: clipboardData});
        target.dispatchEvent(event);
        return {clipboardData, event};
    };

    it('removes the browser copy listener on unmount', () => {
        // Given the copy helper is mounted and then unmounted
        const {unmount} = renderHook(() => useCopySelectionEvent());
        unmount();

        // When the browser dispatches another copy event
        dispatchCopyEvent();

        // Then the unmounted helper does not process the selection
        expect(mockGetCurrentSelection).not.toHaveBeenCalled();
    });

    it('keeps another consumer active when one copy listener unmounts', () => {
        // Given two selectable views are mounted with independent copy listeners
        const selection = 'Draft Expense Report TJS 10.00';
        mockGetCurrentSelection.mockReturnValue(selection);
        mockGetClipboardText.mockReturnValue(selection);
        const firstConsumer = renderHook(() => useCopySelectionEvent());
        const secondConsumer = renderHook(() => useCopySelectionEvent());

        // When the first view unmounts and a copy event occurs in the remaining view
        firstConsumer.unmount();
        const {clipboardData, event} = dispatchCopyEvent();

        // Then the remaining listener still normalizes the selected row exactly once
        expect(event.defaultPrevented).toBe(true);
        expect(mockGetCurrentSelection).toHaveBeenCalledTimes(1);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(1, 'text/html', selection);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(2, 'text/plain', selection);
        secondConsumer.unmount();
    });

    it('writes the scraped selection as HTML and plain text', () => {
        // Given the scraper returns a formatted selection
        const selection = '<strong>Expense description</strong>';
        mockGetCurrentSelection.mockReturnValue(selection);
        mockGetClipboardText.mockReturnValue('Expense description');
        renderHook(() => useCopySelectionEvent());

        // When the browser dispatches a copy event
        const {clipboardData, event} = dispatchCopyEvent();

        // Then the scraper output is written once in both clipboard formats
        expect(event.defaultPrevented).toBe(true);
        expect(mockGetCurrentSelection).toHaveBeenCalledTimes(1);
        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(clipboardData.clearData).toHaveBeenCalledTimes(1);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(1, 'text/html', selection);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(2, 'text/plain', 'Expense description');
    });

    it('writes a plain non-Markdown selection without additional filtering', () => {
        // Given the scraper returns a plain copyable field value
        const selection = 'Merchant';
        mockGetCurrentSelection.mockReturnValue(selection);
        mockGetClipboardText.mockReturnValue(selection);
        renderHook(() => useCopySelectionEvent());

        // When the browser dispatches a copy event
        const {clipboardData, event} = dispatchCopyEvent();

        // Then the plain selection is written through the same clipboard path
        expect(event.defaultPrevented).toBe(true);
        expect(mockGetCurrentSelection).toHaveBeenCalledTimes(1);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(1, 'text/html', selection);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(2, 'text/plain', selection);
    });

    it('does not process an event that another copy handler already handled', () => {
        // Given another copy handler has already handled the event
        renderHook(() => useCopySelectionEvent());
        const event = new Event('copy', {bubbles: true, cancelable: true});
        event.preventDefault();
        Object.defineProperty(event, 'clipboardData', {
            value: {clearData: jest.fn(), setData: jest.fn()},
        });

        // When the event reaches this helper
        document.dispatchEvent(event);

        // Then the selection is not scraped a second time
        expect(mockGetCurrentSelection).not.toHaveBeenCalled();
    });

    it('does nothing when there is no selected content', () => {
        // Given there is no current browser selection
        mockGetCurrentSelection.mockReturnValue('');
        renderHook(() => useCopySelectionEvent());

        // When the browser dispatches a copy event
        const {clipboardData, event} = dispatchCopyEvent();

        // Then native copy behavior is left unchanged
        expect(event.defaultPrevented).toBe(false);
        expect(mockGetClipboardText).not.toHaveBeenCalled();
        expect(clipboardData.clearData).not.toHaveBeenCalled();
        expect(clipboardData.setData).not.toHaveBeenCalled();
    });

    it('leaves copying from text inputs to the browser', () => {
        // Given a text input is the source of the copy event
        const input = document.createElement('input');
        input.value = 'Expense description';
        input.setSelectionRange(0, input.value.length);
        document.body.appendChild(input);
        renderHook(() => useCopySelectionEvent());

        // When the input dispatches a copy event
        const {clipboardData, event} = dispatchCopyEvent(input);

        // Then the helper preserves the input's native copy behavior
        expect(event.defaultPrevented).toBe(false);
        expect(mockGetCurrentSelection).not.toHaveBeenCalled();
        expect(clipboardData.setData).not.toHaveBeenCalled();
        input.remove();
    });

    it('processes a row selection when a previously focused input remains the copy event target', () => {
        // Given an input remains focused without selected input text while a copyable row is selected
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();
        input.setSelectionRange(0, 0);
        const selection = 'Oct 6 Draft Expense Report TJS 10.00';
        mockGetCurrentSelection.mockReturnValue(selection);
        mockGetClipboardText.mockReturnValue(selection);
        renderHook(() => useCopySelectionEvent());

        // When the browser targets the stale focused input for the copy event
        const {clipboardData, event} = dispatchCopyEvent(input);

        // Then the selected row is normalized instead of falling back to native rich-text copying
        expect(event.defaultPrevented).toBe(true);
        expect(mockGetCurrentSelection).toHaveBeenCalledTimes(1);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(1, 'text/html', selection);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(2, 'text/plain', selection);
        input.remove();
    });

    it('leaves copying a selection inside editable content to the browser', () => {
        // Given text is selected inside an editable element
        const editor = document.createElement('div');
        Object.defineProperty(editor, 'isContentEditable', {value: true});
        editor.textContent = 'Expense description';
        document.body.appendChild(editor);
        const range = document.createRange();
        range.selectNodeContents(editor);
        const browserSelection = window.getSelection();
        browserSelection?.addRange(range);
        renderHook(() => useCopySelectionEvent());

        // When the editable element dispatches the copy event
        const {clipboardData, event} = dispatchCopyEvent(editor);

        // Then its native rich-text copy behavior remains unchanged
        expect(event.defaultPrevented).toBe(false);
        expect(mockGetCurrentSelection).not.toHaveBeenCalled();
        expect(clipboardData.setData).not.toHaveBeenCalled();
        editor.remove();
    });

    it('processes a row selection when a previously focused editable element remains the copy event target', () => {
        // Given an editable element remains the event target while the browser selection is in a report row
        const editor = document.createElement('div');
        Object.defineProperty(editor, 'isContentEditable', {value: true});
        const row = document.createElement('div');
        row.textContent = 'Oct 6 Draft Expense Report TJS 10.00';
        document.body.append(editor, row);
        const range = document.createRange();
        range.selectNodeContents(row);
        const browserSelection = window.getSelection();
        browserSelection?.addRange(range);
        mockGetCurrentSelection.mockReturnValue(row.textContent);
        mockGetClipboardText.mockReturnValue(row.textContent);
        renderHook(() => useCopySelectionEvent());

        // When the stale editable element dispatches the copy event
        const {clipboardData, event} = dispatchCopyEvent(editor);

        // Then the report row is normalized instead of using native rich-text copying
        expect(event.defaultPrevented).toBe(true);
        expect(mockGetCurrentSelection).toHaveBeenCalledTimes(1);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(1, 'text/html', row.textContent);
        expect(clipboardData.setData).toHaveBeenNthCalledWith(2, 'text/plain', row.textContent);
        editor.remove();
        row.remove();
    });
});
