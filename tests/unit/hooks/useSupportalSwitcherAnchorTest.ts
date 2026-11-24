import {act, renderHook} from '@testing-library/react-native';

import useSupportalSwitcherAnchor from '@components/Navigation/SupportalSwitcher/useSupportalSwitcherAnchor';

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

    it('shows the switcher at the measured position', async () => {
        // Given a trigger being pressed
        const showSwitcher = jest.fn();
        const {result} = renderHook(() => useSupportalSwitcherAnchor(showSwitcher));
        act(() => result.current.openSwitcher());

        // When the measurement resolves
        await act(async () => {
            mockResolvePosition?.({horizontal: 8, vertical: 600, width: 216, height: 40});
        });

        // Then the switcher is shown once, anchored where the trigger was measured
        expect(showSwitcher).toHaveBeenCalledTimes(1);
        expect(result.current.anchorPosition).toEqual({horizontal: 8, vertical: 600});
    });

    it('ignores a second press while the first measurement is in flight', async () => {
        // Given a press whose measurement has not resolved yet
        const showSwitcher = jest.fn();
        const {result} = renderHook(() => useSupportalSwitcherAnchor(showSwitcher));
        act(() => result.current.openSwitcher());

        // When the trigger is pressed again, e.g. a double click or a held Enter key
        act(() => result.current.openSwitcher());

        // Then only one measurement started, so the switcher cannot open twice
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
        await act(async () => {
            mockResolvePosition?.({horizontal: 0, vertical: 0, width: 0, height: 0});
        });
        expect(showSwitcher).toHaveBeenCalledTimes(1);
    });

    it('accepts a new press once the previous measurement is done', async () => {
        // Given a press that already finished
        const showSwitcher = jest.fn();
        const {result} = renderHook(() => useSupportalSwitcherAnchor(showSwitcher));
        act(() => result.current.openSwitcher());
        await act(async () => {
            mockResolvePosition?.({horizontal: 0, vertical: 0, width: 0, height: 0});
        });

        // When the trigger is pressed again, e.g. after the switcher was dismissed
        act(() => result.current.openSwitcher());

        // Then a new measurement starts, so the trigger is not locked for good
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(2);
    });
});
