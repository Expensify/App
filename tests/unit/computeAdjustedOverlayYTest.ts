import computeAdjustedOverlayY from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeAdjustedOverlayY';

describe('computeAdjustedOverlayY', () => {
    it('returns y unchanged when heightDelta is zero', () => {
        expect(computeAdjustedOverlayY(416, 291, 0)).toBe(416);
    });

    it('returns y unchanged when heightDelta is negative', () => {
        expect(computeAdjustedOverlayY(416, 291, -10)).toBe(416);
    });

    it('returns y unchanged when effectiveHeight is undefined', () => {
        expect(computeAdjustedOverlayY(416, undefined, 173)).toBe(416);
    });

    it('leaves a top-anchored overlay untouched', () => {
        expect(computeAdjustedOverlayY(40, 291, 173)).toBe(40);
    });

    it('leaves an overlay exactly at the new height untouched', () => {
        expect(computeAdjustedOverlayY(291, 291, 173)).toBe(291);
    });

    it('shifts a bottom-anchored overlay up by the height delta', () => {
        expect(computeAdjustedOverlayY(416, 291, 173)).toBe(243);
    });

    it('shifts any overlay below the new height, not just the reported legend', () => {
        expect(computeAdjustedOverlayY(300, 291, 173)).toBe(127);
    });
});
