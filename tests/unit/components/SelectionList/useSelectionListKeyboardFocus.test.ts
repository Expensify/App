import {act, renderHook} from '@testing-library/react-native';
import useSelectionListKeyboardFocus from '@components/SelectionList/hooks/useSelectionListKeyboardFocus';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {addKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import {isFocusRestoreInProgress} from '@libs/NavigationFocusReturn';
import CONST from '@src/CONST';

jest.mock('@hooks/useArrowKeyFocusManager', () => jest.fn());
jest.mock('@libs/NavigationFocusReturn', () => ({
    isFocusRestoreInProgress: jest.fn(() => false),
}));
jest.mock('@libs/KeyboardShortcut/KeyDownPressListener', () => ({
    addKeyDownPressListener: jest.fn(),
    removeKeyDownPressListener: jest.fn(),
}));

const mockUseArrowKeyFocusManager = jest.mocked(useArrowKeyFocusManager);
const mockIsFocusRestoreInProgress = jest.mocked(isFocusRestoreInProgress);
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
        mockIsFocusRestoreInProgress.mockReturnValue(false);
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
        it('scrolls to the new index', () => {
            const {scrollToIndex} = renderKeyboardFocus();
            capturedConfig.onFocusedIndexChange?.(5);
            expect(scrollToIndex).toHaveBeenCalledWith(5);
        });

        it('does not scroll when shouldScrollToFocusedIndex is false', () => {
            const {scrollToIndex} = renderKeyboardFocus({shouldScrollToFocusedIndex: false});
            capturedConfig.onFocusedIndexChange?.(5);
            expect(scrollToIndex).not.toHaveBeenCalled();
        });

        it('uses the debounced scroll when shouldDebounceScrolling is true', () => {
            const {scrollToIndex, debouncedScrollToIndex} = renderKeyboardFocus({shouldDebounceScrolling: true});
            capturedConfig.onFocusedIndexChange?.(5);
            expect(debouncedScrollToIndex).toHaveBeenCalledWith(5);
            expect(scrollToIndex).not.toHaveBeenCalled();
        });
    });

    describe('suppressNextFocusScroll', () => {
        it('suppresses exactly one subsequent scroll', () => {
            const {result, scrollToIndex} = renderKeyboardFocus();
            result.current.suppressNextFocusScroll();

            capturedConfig.onFocusedIndexChange?.(5);
            expect(scrollToIndex).not.toHaveBeenCalled();

            capturedConfig.onFocusedIndexChange?.(6);
            expect(scrollToIndex).toHaveBeenCalledWith(6);
        });
    });

    describe('setFocusedIndexWithoutScrollOnChange', () => {
        it('moves the cursor and suppresses the scroll when the index changes', () => {
            const {result, scrollToIndex} = renderKeyboardFocus();
            result.current.setFocusedIndexWithoutScrollOnChange(5);

            expect(mockSetFocusedIndex).toHaveBeenCalledWith(5);
            capturedConfig.onFocusedIndexChange?.(5);
            expect(scrollToIndex).not.toHaveBeenCalled();
        });

        it('does not arm suppression when the index is unchanged', () => {
            const {result, scrollToIndex} = renderKeyboardFocus();
            result.current.setFocusedIndexWithoutScrollOnChange(FOCUSED_INDEX);

            expect(mockSetFocusedIndex).toHaveBeenCalledWith(FOCUSED_INDEX);
            capturedConfig.onFocusedIndexChange?.(FOCUSED_INDEX);
            expect(scrollToIndex).toHaveBeenCalledWith(FOCUSED_INDEX);
        });
    });

    describe('setFocusedIndexFromRowFocus', () => {
        it('suppresses the scroll while a focus restore is in progress', () => {
            mockIsFocusRestoreInProgress.mockReturnValue(true);
            const {result, scrollToIndex} = renderKeyboardFocus();

            result.current.setFocusedIndexFromRowFocus(5);

            expect(mockSetFocusedIndex).toHaveBeenCalledWith(5);
            capturedConfig.onFocusedIndexChange?.(5);
            expect(scrollToIndex).not.toHaveBeenCalled();
        });

        it('moves the cursor and scrolls normally when no restore is in progress', () => {
            mockIsFocusRestoreInProgress.mockReturnValue(false);
            const {result, scrollToIndex} = renderKeyboardFocus();

            result.current.setFocusedIndexFromRowFocus(5);

            expect(mockSetFocusedIndex).toHaveBeenCalledWith(5);
            capturedConfig.onFocusedIndexChange?.(5);
            expect(scrollToIndex).toHaveBeenCalledWith(5);
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
