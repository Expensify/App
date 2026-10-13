import {act, renderHook} from '@testing-library/react-native';

import ControlSelection from '@libs/ControlSelection';

import type useCopyableTextRowPressModule from '../../../src/hooks/useCopyableTextRowPress/index';
import type {isPressStartOnCopyableText as isPressStartOnCopyableTextModule} from '../../../src/hooks/useCopyableTextRowPress/index';

const copyableTextRowPressModule = jest.requireActual<{
    default: typeof useCopyableTextRowPressModule;
    isPressStartOnCopyableText: typeof isPressStartOnCopyableTextModule;
}>('../../../src/hooks/useCopyableTextRowPress/index.ts');
const {default: useCopyableTextRowPress, isPressStartOnCopyableText} = copyableTextRowPressModule;
const originalGetClientRectsDescriptor = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects');

function getCopyableTextElement(): HTMLElement {
    const element = document.getElementById('copyableText');
    if (!element) {
        throw new Error('Missing copyable text element');
    }

    return element;
}

function selectElementText(element: HTMLElement) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);

    selection?.removeAllRanges();
    selection?.addRange(range);
}

describe('useCopyableTextRowPress', () => {
    beforeEach(() => {
        document.body.innerHTML = '<span id="copyableText" data-copyable-text="true">Copy me</span>';
        window.getSelection()?.removeAllRanges();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        if (originalGetClientRectsDescriptor) {
            Object.defineProperty(Range.prototype, 'getClientRects', originalGetClientRectsDescriptor);
        } else {
            Reflect.deleteProperty(Range.prototype, 'getClientRects');
        }
    });

    it('suppresses row press after selecting copyable text', () => {
        const {result} = renderHook(() => useCopyableTextRowPress());
        const copyableTextElement = getCopyableTextElement();
        selectElementText(copyableTextElement);

        expect(result.current.markMouseDownOnCopyableText(copyableTextElement)).toBe(true);
        expect(result.current.shouldSuppressCopyableTextRowPress()).toBe(true);
        expect(result.current.shouldSuppressCopyableTextRowPress()).toBe(false);
    });

    it('suppresses the next row press for double-click selection starts', () => {
        const {result} = renderHook(() => useCopyableTextRowPress());
        const copyableTextElement = getCopyableTextElement();

        expect(result.current.markMouseDownOnCopyableText(copyableTextElement, true, {shouldSuppressNextPress: true})).toBe(true);
        expect(result.current.shouldSuppressCopyableTextRowPress()).toBe(true);
    });

    it('suppresses row long press after touch starts on copyable text', () => {
        const {result} = renderHook(() => useCopyableTextRowPress());
        const copyableTextElement = getCopyableTextElement();

        expect(result.current.markTouchStartOnCopyableText({target: copyableTextElement})).toBe(true);
        expect(result.current.shouldSuppressCopyableTextRowLongPress()).toBe(true);
    });

    it('tracks copyable touch starts for consumers that need to preserve native text selection', () => {
        const {result} = renderHook(() => useCopyableTextRowPress({shouldTrackTouchStart: true}));
        const copyableTextElement = getCopyableTextElement();
        const blockSelectionSpy = jest.spyOn(ControlSelection, 'block').mockImplementation();

        act(() => {
            result.current.markTouchStartOnCopyableText({target: copyableTextElement});
        });

        expect(result.current.didTouchStartOnCopyableText).toBe(true);
        result.current.handleCopyableTextRowPressIn({shouldEnableTextSelection: true, shouldBlockSelection: true});
        expect(blockSelectionSpy).not.toHaveBeenCalled();

        act(() => {
            result.current.markMouseDownOnCopyableText(copyableTextElement);
        });

        expect(result.current.didTouchStartOnCopyableText).toBe(false);
        result.current.handleCopyableTextRowPressIn({shouldEnableTextSelection: true, shouldBlockSelection: true});
        expect(blockSelectionSpy).toHaveBeenCalledTimes(1);
    });

    it('does not suppress row press when the press starts outside copyable text', () => {
        document.body.innerHTML = '<span id="regularText">Regular text</span>';
        const regularTextElement = document.getElementById('regularText');
        const {result} = renderHook(() => useCopyableTextRowPress());

        expect(result.current.markMouseDownOnCopyableText(regularTextElement)).toBe(false);
        expect(result.current.shouldSuppressCopyableTextRowPress()).toBe(false);
    });

    it('caches expensive copyable text hit testing for the same press', () => {
        const {result} = renderHook(() => useCopyableTextRowPress());
        const copyableTextElement = getCopyableTextElement();
        const getClientRectsMock = jest.fn(() => [
            {
                bottom: 20,
                height: 20,
                left: 0,
                right: 100,
                top: 0,
                width: 100,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            },
        ]);
        Object.defineProperty(Range.prototype, 'getClientRects', {
            configurable: true,
            value: getClientRectsMock,
        });
        const pressEvent = {
            clientX: 10,
            clientY: 10,
            target: copyableTextElement,
        };

        expect(result.current.isPressStartOnCopyableText(pressEvent)).toBe(true);
        expect(result.current.isPressStartOnCopyableText(pressEvent)).toBe(true);
        expect(getClientRectsMock).toHaveBeenCalledTimes(1);
    });

    it('does not treat blank space inside a copyable element as copyable text', () => {
        // Given a copyable element whose layout extends beyond its rendered text
        const copyableTextElement = getCopyableTextElement();
        Object.defineProperty(Range.prototype, 'getClientRects', {
            configurable: true,
            value: () => [
                {
                    bottom: 20,
                    height: 20,
                    left: 0,
                    right: 100,
                    top: 0,
                    width: 100,
                    x: 0,
                    y: 0,
                    toJSON: () => ({}),
                },
            ],
        });

        // When the touch starts within the element but outside the text glyph bounds
        const isCopyableText = isPressStartOnCopyableText({clientX: 150, clientY: 10, target: copyableTextElement});

        // Then the blank area remains available for the row long-press action
        expect(isCopyableText).toBe(false);
    });
});
