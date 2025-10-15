import {act, renderHook} from '@testing-library/react-native';
import type {View} from 'react-native';
import usePopoverPosition from '@hooks/usePopoverPosition';
import CONST from '@src/CONST';

// Mock responsive layout to control small/large screen behavior
let mockIsSmallScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: mockIsSmallScreenWidth}));

type MeasureInWindow = (callback: (x: number, y: number, width: number, height: number) => void) => void;

const createAnchorRef = (x: number, y: number, width: number, height: number) => {
    const measureInWindow: MeasureInWindow = (callback) => callback(x, y, width, height);
    return {current: {measureInWindow} as unknown as View};
};

describe('usePopoverPosition', () => {
    beforeEach(() => {
        mockIsSmallScreenWidth = false;
    });

    it('returns zeros on small screens', async () => {
        mockIsSmallScreenWidth = true;
        const {result} = renderHook(() => usePopoverPosition());
        const anchorRef = createAnchorRef(10, 20, 100, 50);

        let position;
        await act(async () => {
            position = await result.current.calculatePopoverPosition(anchorRef);
        });

        expect(position).toEqual({horizontal: 0, vertical: 0, width: 0, height: 0});
    });

    it('computes default RIGHT/TOP alignment', async () => {
        const {result} = renderHook(() => usePopoverPosition());
        const anchorRef = createAnchorRef(10, 20, 100, 50);

        // Default: RIGHT/TOP → horizontal = x + width, vertical = y + height + padding
        let position;
        await act(async () => {
            position = await result.current.calculatePopoverPosition(anchorRef);
        });

        expect(position).toEqual({
            horizontal: 10 + 100,
            vertical: 20 + 50 + CONST.MODAL.POPOVER_MENU_PADDING,
            width: 100,
            height: 50,
        });
    });

    it('computes LEFT/TOP alignment', async () => {
        const {result} = renderHook(() => usePopoverPosition());
        const anchorRef = createAnchorRef(5, 8, 40, 20);

        let position;
        await act(async () => {
            position = await result.current.calculatePopoverPosition(anchorRef, {
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            });
        });

        expect(position).toEqual({
            horizontal: 5,
            vertical: 8 + 20 + CONST.MODAL.POPOVER_MENU_PADDING,
            width: 40,
            height: 20,
        });
    });

    it('computes CENTER/BOTTOM alignment', async () => {
        const {result} = renderHook(() => usePopoverPosition());
        const anchorRef = createAnchorRef(0, 100, 60, 30);

        let position;
        await act(async () => {
            position = await result.current.calculatePopoverPosition(anchorRef, {
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            });
        });

        expect(position).toEqual({
            horizontal: 0 + 60 / 2,
            vertical: 100 - CONST.MODAL.POPOVER_MENU_PADDING,
            width: 60,
            height: 30,
        });
    });
});
