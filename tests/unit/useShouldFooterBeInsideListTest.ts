import {renderHook} from '@testing-library/react-native';

import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';

/**
 * `useShouldFooterBeInsideList` decides whether a selection list's confirm button scrolls with the list
 * instead of being fixed to the bottom. It must be true only when the device is in landscape mode AND the
 * keyboard is open — that is the only case where a fixed footer eats the space the list needs.
 */
const mockIsInLandscapeMode = jest.fn(() => false);
jest.mock('@hooks/useIsInLandscapeMode', () => ({
    __esModule: true,
    default: () => mockIsInLandscapeMode(),
}));

const mockIsKeyboardActive = jest.fn(() => false);
jest.mock('@hooks/useKeyboardState', () => ({
    __esModule: true,
    default: () => ({isKeyboardActive: mockIsKeyboardActive()}),
}));

describe('useShouldFooterBeInsideList', () => {
    afterEach(() => {
        mockIsInLandscapeMode.mockReturnValue(false);
        mockIsKeyboardActive.mockReturnValue(false);
    });

    it('returns true in landscape mode with the keyboard open', () => {
        mockIsInLandscapeMode.mockReturnValue(true);
        mockIsKeyboardActive.mockReturnValue(true);

        const {result} = renderHook(() => useShouldFooterBeInsideList());

        expect(result.current).toBe(true);
    });

    it('returns false in landscape mode while the keyboard is closed', () => {
        mockIsInLandscapeMode.mockReturnValue(true);
        mockIsKeyboardActive.mockReturnValue(false);

        const {result} = renderHook(() => useShouldFooterBeInsideList());

        expect(result.current).toBe(false);
    });

    it('returns false in portrait mode with the keyboard open', () => {
        mockIsInLandscapeMode.mockReturnValue(false);
        mockIsKeyboardActive.mockReturnValue(true);

        const {result} = renderHook(() => useShouldFooterBeInsideList());

        expect(result.current).toBe(false);
    });

    it('returns false in portrait mode while the keyboard is closed', () => {
        const {result} = renderHook(() => useShouldFooterBeInsideList());

        expect(result.current).toBe(false);
    });

    it('reacts to the keyboard opening while the hook stays mounted', () => {
        mockIsInLandscapeMode.mockReturnValue(true);

        const {result, rerender} = renderHook(() => useShouldFooterBeInsideList());
        expect(result.current).toBe(false);

        mockIsKeyboardActive.mockReturnValue(true);
        rerender({});

        expect(result.current).toBe(true);
    });
});
