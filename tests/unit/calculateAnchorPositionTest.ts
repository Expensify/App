import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';

// Mock a context menu anchor component
const createMockAnchor = () => ({
    measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) => {
        callback(100, 200, 50, 30);
    },
});

describe('calculateAnchorPosition', () => {
    it('should return zero dimensions when anchorComponent is null', async () => {
        const result = await calculateAnchorPosition(null);

        expect(result).toEqual({
            horizontal: 0,
            vertical: 0,
            width: 0,
            height: 0,
        });
    });

    it('should return zero dimensions when anchorComponent does not have measureInWindow', async () => {
        const mockAnchor = {} as ContextMenuAnchor;
        const result = await calculateAnchorPosition(mockAnchor);

        expect(result).toEqual({
            horizontal: 0,
            vertical: 0,
            width: 0,
            height: 0,
        });
    });

    it('should calculate position for top-left anchor origin', async () => {
        const mockAnchor = createMockAnchor() as ContextMenuAnchor;
        const anchorOrigin = {
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            shiftVertical: 10,
        };

        const result = await calculateAnchorPosition(mockAnchor, anchorOrigin);

        expect(result).toEqual({
            horizontal: 100,
            vertical: 240, // y + height + shiftVertical (200 + 30 + 10)
            width: 50,
            height: 30,
        });
    });

    it('should calculate position for default anchor origin (bottom-right)', async () => {
        const mockAnchor = createMockAnchor() as ContextMenuAnchor;
        const anchorOrigin = {
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            shiftVertical: 5,
        };

        const result = await calculateAnchorPosition(mockAnchor, anchorOrigin);

        expect(result).toEqual({
            horizontal: 150, // x + width (100 + 50)
            vertical: 205, // y + shiftVertical (200 + 5)
            width: 50,
            height: 30,
        });
    });

    it('should handle zero shiftVertical when not provided', async () => {
        const mockAnchor = createMockAnchor() as ContextMenuAnchor;
        const anchorOrigin = {
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        };

        const result = await calculateAnchorPosition(mockAnchor, anchorOrigin);

        expect(result).toEqual({
            horizontal: 100,
            vertical: 230, // y + height (200 + 30)
            width: 50,
            height: 30,
        });
    });
});
