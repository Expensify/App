import useSelectionListKeyboardFocus from '@components/SelectionList/hooks/useSelectionListKeyboardFocus';

import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';

import {addKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';

import CONST from '@src/CONST';

import {act, renderHook} from '@testing-library/react-native';

jest.mock('@hooks/useArrowKeyFocusManager', () => jest.fn());
jest.mock('@libs/KeyboardShortcut/KeyDownPressListener', () => ({
    addKeyDownPressListener: jest.fn(),
    removeKeyDownPressListener: jest.fn(),
}));

const mockUseArrowKeyFocusManager = jest.mocked(useArrowKeyFocusManager);
const mockAddKeyDownPressListener = jest.mocked(addKeyDownPressListener);

const FOCUSED_INDEX = 3;
const mockSetFocusedIndex = jest.fn();
let capturedConfig: Parameters<typeof useArrowKeyFocusManager>[0];

type Overrides = {
    maxIndex?: number;
    disabledIndexes?: readonly number[];
    isActive?: boolean;
    isFocused?: boolean;
    shouldScrollToFocusedIndex?: boolean;
    shouldDebounceScrolling?: boolean;
    initialFocusedIndex?: number;
};

function renderKeyboardFocus(overrides: Overrides = {}) {
    const scrollToIndex = jest.fn();
    const debouncedScrollToIndex = jest.fn();
    const setShouldDisableHoverStyle = jest.fn();
    const announceProgrammaticScroll = jest.fn();

    const {result} = renderHook(() =>
        useSelectionListKeyboardFocus({
            initialFocusedIndex: FOCUSED_INDEX,
            maxIndex: 9,
            disabledIndexes: [],
            isActive: true,
            isFocused: true,
            shouldScrollToFocusedIndex: true,
            shouldDebounceScrolling: false,
            scrollToIndex,
            debouncedScrollToIndex,
            announceProgrammaticScroll,
            setShouldDisableHoverStyle,
            ...overrides,
        }),
    );

    return {result, scrollToIndex, debouncedScrollToIndex, setShouldDisableHoverStyle, announceProgrammaticScroll};
}

describe('useSelectionListKeyboardFocus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseArrowKeyFocusManager.mockImplementation((config) => {
            capturedConfig = config;
            return [FOCUSED_INDEX, mockSetFocusedIndex];
        });
    });

    it('forwards the navigation config to useArrowKeyFocusManager', () => {
        renderKeyboardFocus({maxIndex: 9, disabledIndexes: [2], isActive: true, isFocused: true, initialFocusedIndex: FOCUSED_INDEX});
        expect(mockUseArrowKeyFocusManager).toHaveBeenCalledWith(
            expect.objectContaining({maxIndex: 9, disabledIndexes: [2], isActive: true, isFocused: true, initialFocusedIndex: FOCUSED_INDEX}),
        );
    });

    describe('onFocusedIndexChange (scroll on cursor move)', () => {
        it('scrolls to the new index when shouldScrollHint is true', () => {
            const {scrollToIndex} = renderKeyboardFocus();
            capturedConfig.onFocusedIndexChange?.(5, true);
            expect(scrollToIndex).toHaveBeenCalledWith(5);
        });

        it('does not scroll when shouldScrollHint is false', () => {
            const {scrollToIndex} = renderKeyboardFocus();
            capturedConfig.onFocusedIndexChange?.(5, false);
            expect(scrollToIndex).not.toHaveBeenCalled();
        });

        it('does not scroll when shouldScrollToFocusedIndex is false', () => {
            const {scrollToIndex} = renderKeyboardFocus({shouldScrollToFocusedIndex: false});
            capturedConfig.onFocusedIndexChange?.(5, true);
            expect(scrollToIndex).not.toHaveBeenCalled();
        });

        it('uses the debounced scroll when shouldDebounceScrolling is true', () => {
            const {scrollToIndex, debouncedScrollToIndex} = renderKeyboardFocus({shouldDebounceScrolling: true});
            capturedConfig.onFocusedIndexChange?.(5, true);
            expect(debouncedScrollToIndex).toHaveBeenCalledWith(5);
            expect(scrollToIndex).not.toHaveBeenCalled();
        });
    });

    describe('onArrowUpDownCallback', () => {
        it('disables hover styling and announces a programmatic scroll', () => {
            const {setShouldDisableHoverStyle, announceProgrammaticScroll} = renderKeyboardFocus();
            capturedConfig.onArrowUpDownCallback?.();
            expect(setShouldDisableHoverStyle).toHaveBeenCalledWith(true);
            expect(announceProgrammaticScroll).toHaveBeenCalledTimes(1);
        });
    });

    describe('keyboard-navigation modality', () => {
        it('starts inactive and turns on via setHasKeyBeenPressed', () => {
            const {result} = renderKeyboardFocus();
            expect(result.current.isKeyboardNavigating).toBe(false);
            act(() => result.current.setHasKeyBeenPressed());
            expect(result.current.isKeyboardNavigating).toBe(true);
        });

        it('turns on when Tab is pressed', () => {
            const {result} = renderKeyboardFocus();
            const handler = mockAddKeyDownPressListener.mock.calls.at(0)?.[0];

            expect(result.current.isKeyboardNavigating).toBe(false);
            act(() => handler?.(new KeyboardEvent('keydown', {key: CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey})));
            expect(result.current.isKeyboardNavigating).toBe(true);
        });

        it('ignores non-Tab keys', () => {
            const {result} = renderKeyboardFocus();
            const handler = mockAddKeyDownPressListener.mock.calls.at(0)?.[0];

            act(() => handler?.(new KeyboardEvent('keydown', {key: 'a'})));
            expect(result.current.isKeyboardNavigating).toBe(false);
        });
    });
});
