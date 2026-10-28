import {act, renderHook} from '@testing-library/react-native';

import useSelectionListKeyboardFocus from '@components/SelectionList/hooks/useSelectionListKeyboardFocus';

import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';

import {addKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';

import CONST from '@src/CONST';

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
    shouldAllowArrowUpToSearchInput?: boolean;
    onArrowUpToSearchInput?: () => void;
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

    describe('onArrowUpToSearchInput', () => {
        it('is called when ArrowUp moves the focused index to the search input', () => {
            // Given a list that lets ArrowUp leave the first row for the search input
            const onArrowUpToSearchInput = jest.fn();
            renderKeyboardFocus({shouldAllowArrowUpToSearchInput: true, onArrowUpToSearchInput});

            // When an arrow-key move sets the focused index to -1
            capturedConfig.onFocusedIndexChange?.(-1, true);

            // Then the list is told to move DOM focus to the search input, since a Tab-focused row would otherwise keep it
            expect(onArrowUpToSearchInput).toHaveBeenCalledTimes(1);
        });

        it('is not called when the focused index is cleared without an arrow key', () => {
            // Given a list that lets ArrowUp leave the first row for the search input
            const onArrowUpToSearchInput = jest.fn();
            renderKeyboardFocus({shouldAllowArrowUpToSearchInput: true, onArrowUpToSearchInput});

            // When the focused index is cleared externally, for example by pressing the search input
            capturedConfig.onFocusedIndexChange?.(-1, false);

            // Then focus is left alone, because the search input already holds it
            expect(onArrowUpToSearchInput).not.toHaveBeenCalled();
        });

        it('is not called when the list does not opt in', () => {
            // Given a list that keeps the default ArrowUp behavior
            const onArrowUpToSearchInput = jest.fn();
            renderKeyboardFocus({onArrowUpToSearchInput});

            // When an arrow-key move sets the focused index to -1
            capturedConfig.onFocusedIndexChange?.(-1, true);

            // Then DOM focus is not moved, preserving existing behavior for other lists
            expect(onArrowUpToSearchInput).not.toHaveBeenCalled();
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
