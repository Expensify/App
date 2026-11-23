import {act, renderHook} from '@testing-library/react-native';

import useSupportalSwitcherAnchor, {SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT} from '@components/Navigation/SupportalSwitcher/useSupportalSwitcherAnchor';

type Position = {horizontal: number; vertical: number; width: number; height: number};

let mockResolvePosition: ((position: Position) => void) | undefined;
const mockCalculatePopoverPosition = jest.fn(
    () =>
        new Promise<Position>((resolve) => {
            mockResolvePosition = resolve;
        }),
);

jest.mock('@hooks/usePopoverPosition', () => ({
    __esModule: true,
    default: () => ({calculatePopoverPosition: mockCalculatePopoverPosition}),
}));

describe('useSupportalSwitcherAnchor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockResolvePosition = undefined;
    });

    it('opens the switcher with its own alignment at the measured position', async () => {
        // Given a Supportal trigger being pressed
        const showSwitcher = jest.fn();
        const {result} = renderHook(() => useSupportalSwitcherAnchor(showSwitcher));
        act(() => result.current.openSwitcher());

        // When the measurement resolves
        await act(async () => {
            mockResolvePosition?.({horizontal: 8, vertical: 600, width: 216, height: 40});
        });

        // Then the trigger was measured with the switcher's alignment, and the switcher is shown once where the trigger was measured
        expect(mockCalculatePopoverPosition).toHaveBeenCalledWith(result.current.anchorRef, SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT);
        expect(showSwitcher).toHaveBeenCalledTimes(1);
        expect(result.current.anchorPosition).toEqual({horizontal: 8, vertical: 600});
    });
});
