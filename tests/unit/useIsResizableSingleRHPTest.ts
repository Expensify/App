import {renderHook} from '@testing-library/react-native';

import useIsResizableSingleRHP from '@hooks/useIsResizableSingleRHP';

type MockWideRHPState = {
    wideRHPRouteKeys: string[];
    superWideRHPRouteKeys: string[];
    isWideRHPFocused: boolean;
    isSuperWideRHPFocused: boolean;
};

const LONE_SINGLE_RHP: MockWideRHPState = {wideRHPRouteKeys: [], superWideRHPRouteKeys: [], isWideRHPFocused: false, isSuperWideRHPFocused: false};

let mockWideRHPState = LONE_SINGLE_RHP;
jest.mock('@components/WideRHPContextProvider', () => ({useWideRHPState: () => mockWideRHPState}));

let mockIsSmallScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: mockIsSmallScreenWidth}));

let mockIsResizableRHPEnabled = true;
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => mockIsResizableRHPEnabled}));

describe('useIsResizableSingleRHP', () => {
    beforeEach(() => {
        mockWideRHPState = LONE_SINGLE_RHP;
        mockIsSmallScreenWidth = false;
        mockIsResizableRHPEnabled = true;
    });

    it('lets a lone single RHP be resized', () => {
        // Given a single RHP with nothing wide underneath
        // When the hook reads the layout
        const {result} = renderHook(() => useIsResizableSingleRHP());

        // Then the card can be resized
        expect(result.current).toBe(true);
    });

    it.each([
        ['wide', {...LONE_SINGLE_RHP, wideRHPRouteKeys: ['wide']}],
        ['super-wide', {...LONE_SINGLE_RHP, superWideRHPRouteKeys: ['super-wide']}],
    ])('lets a single RHP stacked on a %s RHP be resized', (_, state) => {
        // Given a focused single RHP opened on top of a wider card, like an expense opened from a report
        mockWideRHPState = state;

        // When the hook reads the layout
        const {result} = renderHook(() => useIsResizableSingleRHP());

        // Then the stacked single card can be resized too
        expect(result.current).toBe(true);
    });

    it.each([
        ['wide', {...LONE_SINGLE_RHP, wideRHPRouteKeys: ['wide'], isWideRHPFocused: true}],
        ['super-wide', {...LONE_SINGLE_RHP, superWideRHPRouteKeys: ['super-wide'], isSuperWideRHPFocused: true}],
    ])('does not resize a focused %s RHP', (_, state) => {
        // Given the wider card is the focused one, so it keeps its own layout
        mockWideRHPState = state;

        // When the hook reads the layout
        const {result} = renderHook(() => useIsResizableSingleRHP());

        // Then nothing can be resized
        expect(result.current).toBe(false);
    });

    it('does not resize on a narrow layout or without the beta', () => {
        // Given a full-screen RHP on a narrow layout
        mockIsSmallScreenWidth = true;

        // When the hook reads the layout
        const {result, rerender} = renderHook(() => useIsResizableSingleRHP());

        // Then there is no edge to drag
        expect(result.current).toBe(false);

        // Given a wide layout but no beta
        mockIsSmallScreenWidth = false;
        mockIsResizableRHPEnabled = false;

        // When the hook reads the layout again
        rerender({});

        // Then resizing stays hidden from users outside the beta
        expect(result.current).toBe(false);
    });
});
