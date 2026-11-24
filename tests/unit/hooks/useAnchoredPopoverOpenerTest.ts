import {act, renderHook} from '@testing-library/react-native';

import useAnchoredPopoverOpener from '@hooks/useAnchoredPopoverOpener';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

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

const ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

describe('useAnchoredPopoverOpener', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockResolvePosition = undefined;
    });

    it('measures the trigger with the given alignment', () => {
        // Given a popover that opens below its trigger
        const {result} = renderHook(() => useAnchoredPopoverOpener<HTMLDivElement>(ANCHOR_ALIGNMENT, jest.fn()));

        // When the trigger is pressed
        act(() => result.current.openPopover());

        // Then the trigger is measured with that alignment, so the popover lines up the way its caller asked
        expect(mockCalculatePopoverPosition).toHaveBeenCalledWith(result.current.anchorRef, ANCHOR_ALIGNMENT);
    });

    it('shows the popover at the measured position', async () => {
        // Given a trigger being pressed
        const showPopover = jest.fn();
        const {result} = renderHook(() => useAnchoredPopoverOpener<HTMLDivElement>(ANCHOR_ALIGNMENT, showPopover));
        act(() => result.current.openPopover());
        expect(showPopover).not.toHaveBeenCalled();

        // When the measurement resolves
        await act(async () => {
            mockResolvePosition?.({horizontal: 8, vertical: 600, width: 216, height: 40});
        });

        // Then the popover is shown once, anchored where the trigger was measured
        expect(showPopover).toHaveBeenCalledTimes(1);
        expect(result.current.anchorPosition).toEqual({horizontal: 8, vertical: 600});
    });

    it('ignores a second press while the first measurement is in flight', async () => {
        // Given a press whose measurement has not resolved yet
        const showPopover = jest.fn();
        const {result} = renderHook(() => useAnchoredPopoverOpener<HTMLDivElement>(ANCHOR_ALIGNMENT, showPopover));
        act(() => result.current.openPopover());

        // When the trigger is pressed again, e.g. a double click or a held Enter key
        act(() => result.current.openPopover());

        // Then only one measurement started, so the popover cannot open twice
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
        await act(async () => {
            mockResolvePosition?.({horizontal: 0, vertical: 0, width: 0, height: 0});
        });
        expect(showPopover).toHaveBeenCalledTimes(1);
    });

    it('accepts a new press once the previous measurement is done', async () => {
        // Given a press that already finished
        const {result} = renderHook(() => useAnchoredPopoverOpener<HTMLDivElement>(ANCHOR_ALIGNMENT, jest.fn()));
        act(() => result.current.openPopover());
        await act(async () => {
            mockResolvePosition?.({horizontal: 0, vertical: 0, width: 0, height: 0});
        });

        // When the trigger is pressed again, e.g. after the popover was dismissed
        act(() => result.current.openPopover());

        // Then a new measurement starts, so the trigger is not locked for good
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(2);
    });
});
