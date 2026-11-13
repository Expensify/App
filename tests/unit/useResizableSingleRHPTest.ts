import {renderHook} from '@testing-library/react-native';

import useResizableSingleRHP from '@hooks/useResizableSingleRHP';

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

describe('useResizableSingleRHP', () => {
    beforeEach(() => {
        mockWideRHPState = LONE_SINGLE_RHP;
        mockIsSmallScreenWidth = false;
        mockIsResizableRHPEnabled = true;
    });

    it('lets a lone single RHP be resized as a floating card', () => {
        // Given a single RHP with nothing wide underneath
        // When the hook reads the layout
        const {result} = renderHook(() => useResizableSingleRHP());

        // Then the card can be resized and the RHP frame itself is the card
        expect(result.current).toEqual({isResizable: true, isFloating: true});
    });

    it.each([
        ['wide', {...LONE_SINGLE_RHP, wideRHPRouteKeys: ['wide']}],
        ['super-wide', {...LONE_SINGLE_RHP, superWideRHPRouteKeys: ['super-wide']}],
    ])('lets a single RHP stacked on a %s RHP be resized without floating', (_, state) => {
        // Given a focused single RHP opened on top of a wider card, like an expense opened from a report
        mockWideRHPState = state;

        // When the hook reads the layout
        const {result} = renderHook(() => useResizableSingleRHP());

        // Then the stacked card can be resized, but it sizes itself instead of the floating frame
        expect(result.current).toEqual({isResizable: true, isFloating: false});
    });

    it.each([
        ['wide', {...LONE_SINGLE_RHP, wideRHPRouteKeys: ['wide'], isWideRHPFocused: true}],
        ['super-wide', {...LONE_SINGLE_RHP, superWideRHPRouteKeys: ['super-wide'], isSuperWideRHPFocused: true}],
    ])('does not resize a focused %s RHP', (_, state) => {
        // Given the wider card is the focused one, so it keeps its own layout
        mockWideRHPState = state;

        // When the hook reads the layout
        const {result} = renderHook(() => useResizableSingleRHP());

        // Then nothing can be resized
        expect(result.current).toEqual({isResizable: false, isFloating: false});
    });

    it('does not resize on a narrow layout', () => {
        // Given a full-screen RHP on a narrow layout
        mockIsSmallScreenWidth = true;

        // When the hook reads the layout
        const {result} = renderHook(() => useResizableSingleRHP());

        // Then there is no edge to drag
        expect(result.current).toEqual({isResizable: false, isFloating: false});
    });

    it('does not resize without the beta', () => {
        // Given a wide layout for a user outside the beta
        mockIsResizableRHPEnabled = false;

        // When the hook reads the layout
        const {result} = renderHook(() => useResizableSingleRHP());

        // Then resizing stays hidden from them
        expect(result.current).toEqual({isResizable: false, isFloating: false});
    });
});
