import getAnchoredPreviewPosition, {
    RECEIPT_PREVIEW_EDGE_MARGIN,
    RECEIPT_PREVIEW_GAP,
    RECEIPT_PREVIEW_MIN_VISIBLE_HEIGHT,
    RECEIPT_PREVIEW_WIDTH,
} from '@components/TransactionItemRow/ReceiptPreview/getAnchoredPreviewPosition';

const WINDOW_WIDTH = 1440;
const WINDOW_HEIGHT = 900;

describe('getAnchoredPreviewPosition', () => {
    it('falls back to the static style (undefined) when there is no anchor', () => {
        expect(getAnchoredPreviewPosition(undefined, WINDOW_WIDTH, WINDOW_HEIGHT)).toBeUndefined();
    });

    it('places the preview just to the left of the hovered thumbnail when there is room', () => {
        const anchor = {top: 300, left: 500, width: 68, height: 64};

        const position = getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT);

        expect(position?.left).toBe(anchor.left - RECEIPT_PREVIEW_WIDTH - RECEIPT_PREVIEW_GAP);
        expect(position?.left).toBeLessThan(anchor.left);
    });

    it('flips to the right of the thumbnail when there is not enough room on the left', () => {
        // A thumbnail hugging the left edge leaves no room for the preview to its left.
        const anchor = {top: 300, left: 120, width: 68, height: 64};

        const position = getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT);

        expect(position?.left).toBe(anchor.left + anchor.width + RECEIPT_PREVIEW_GAP);
    });

    it('clamps the preview to the right edge when neither side fits on a narrow viewport', () => {
        const narrowWidth = 801;
        // Neither side has room: too little space on the left, and flipping right would overflow the edge.
        const anchor = {top: 300, left: 400, width: 68, height: 64};

        const position = getAnchoredPreviewPosition(anchor, narrowWidth, WINDOW_HEIGHT);

        expect(position?.left).toBe(narrowWidth - RECEIPT_PREVIEW_WIDTH - RECEIPT_PREVIEW_EDGE_MARGIN);
        expect((position?.left ?? 0) + RECEIPT_PREVIEW_WIDTH).toBeLessThanOrEqual(narrowWidth - RECEIPT_PREVIEW_EDGE_MARGIN);
    });

    it('aligns the preview top with the hovered row before it has been measured', () => {
        const anchor = {top: 420, left: 120, width: 68, height: 64};

        expect(getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT)?.top).toBe(420);
    });

    it('keeps the preview to the left of a thumbnail near the right edge', () => {
        const anchor = {top: 300, left: WINDOW_WIDTH - 80, width: 68, height: 64};

        const position = getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT);

        expect(position?.left).toBe(anchor.left - RECEIPT_PREVIEW_WIDTH - RECEIPT_PREVIEW_GAP);
        expect(position?.left).toBeLessThan(anchor.left);
    });

    it('clamps a row near the top so the preview stays a margin below the viewport top', () => {
        const anchor = {top: 4, left: 120, width: 68, height: 64};

        expect(getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT)?.top).toBe(RECEIPT_PREVIEW_EDGE_MARGIN);
    });

    it('clamps a row near the bottom so the preview keeps a visible slice on-screen before it has been measured', () => {
        const anchor = {top: WINDOW_HEIGHT - 10, left: 120, width: 68, height: 64};

        expect(getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT)?.top).toBe(WINDOW_HEIGHT - RECEIPT_PREVIEW_MIN_VISIBLE_HEIGHT);
    });

    it("aligns a measured preview's bottom-left corner with the right of the thumbnail (grows upward)", () => {
        const previewHeight = 200;
        const anchor = {top: 300, left: 120, width: 68, height: 64};

        const position = getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT, previewHeight);
        const thumbnailBottom = anchor.top + anchor.height;

        expect(position?.left).toBe(anchor.left + anchor.width + RECEIPT_PREVIEW_GAP);
        expect(position?.top).toBe(thumbnailBottom - previewHeight);
        // Bottom edge lands on the thumbnail's bottom, so the preview sits above-right of the row.
        expect((position?.top ?? 0) + previewHeight).toBe(thumbnailBottom);
    });

    it('keeps a measured preview on-screen for a row near the bottom by growing upward', () => {
        const previewHeight = 600;
        const anchor = {top: WINDOW_HEIGHT - 200, left: 120, width: 68, height: 64};

        const top = getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT, previewHeight)?.top ?? 0;
        const thumbnailBottom = anchor.top + anchor.height;

        expect(top).toBe(thumbnailBottom - previewHeight);
        expect(top).toBeGreaterThanOrEqual(RECEIPT_PREVIEW_EDGE_MARGIN);
        expect(top + previewHeight).toBeLessThanOrEqual(WINDOW_HEIGHT);
    });

    it('caps the preview to the viewport when the hovered row is scrolled partially off the bottom', () => {
        const previewHeight = 200;
        // measureInWindow can report a bottom below the viewport for a row clipped by a scroll container.
        const anchor = {top: WINDOW_HEIGHT - 20, left: 120, width: 68, height: 64};

        const top = getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT, previewHeight)?.top ?? 0;

        expect(top).toBe(WINDOW_HEIGHT - RECEIPT_PREVIEW_EDGE_MARGIN - previewHeight);
        expect(top + previewHeight).toBeLessThanOrEqual(WINDOW_HEIGHT);
    });

    it('pins a preview taller than the space above the row to the top margin', () => {
        const previewHeight = WINDOW_HEIGHT + 200;
        const anchor = {top: 500, left: 120, width: 68, height: 64};

        expect(getAnchoredPreviewPosition(anchor, WINDOW_WIDTH, WINDOW_HEIGHT, previewHeight)?.top).toBe(RECEIPT_PREVIEW_EDGE_MARGIN);
    });
});
