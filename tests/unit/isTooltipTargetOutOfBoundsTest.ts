import isTooltipTargetOutOfBounds from '@components/Tooltip/EducationalTooltip/isTooltipTargetOutOfBounds';

import type {EdgeInsets} from 'react-native-safe-area-context';

const NO_INSETS: EdgeInsets = {top: 0, right: 0, bottom: 0, left: 0};

// Measured on a Pixel 8 (Android 14) with the Copilot switcher on the Accounts page. In landscape the
// display cutout lands on one side, so Dimensions.get('window') reports 862.48 while the full window is
// 914.29 — the difference being the 51.81 cutout inset.
const LANDSCAPE_WINDOW = {width: 862.4761904761905, height: 387.42857142857144};
const LANDSCAPE_INSETS: EdgeInsets = {top: 28.190475463867188, right: 51.80952453613281, bottom: 24, left: 0};
const PORTRAIT_WINDOW = {width: 411.4285583496094, height: 838.4761904761905};

describe('isTooltipTargetOutOfBounds', () => {
    it('should keep a target that sits inside the window in bounds', () => {
        const bounds = {x: 100, y: 300, width: 70, height: 28};

        expect(isTooltipTargetOutOfBounds(bounds, NO_INSETS, PORTRAIT_WINDOW)).toBe(false);
    });

    it('should report a target that scrolled up behind the header as out of bounds', () => {
        const bounds = {x: 100, y: 0, width: 70, height: 28};

        expect(isTooltipTargetOutOfBounds(bounds, NO_INSETS, PORTRAIT_WINDOW)).toBe(true);
    });

    it('should report a target that scrolled below the bottom tab as out of bounds', () => {
        const bounds = {x: 100, y: PORTRAIT_WINDOW.height, width: 70, height: 28};

        expect(isTooltipTargetOutOfBounds(bounds, NO_INSETS, PORTRAIT_WINDOW)).toBe(true);
    });

    it('should report a target that is genuinely off the right edge as out of bounds', () => {
        const bounds = {x: PORTRAIT_WINDOW.width + 5, y: 300, width: 70, height: 28};

        expect(isTooltipTargetOutOfBounds(bounds, NO_INSETS, PORTRAIT_WINDOW)).toBe(true);
    });

    it('should keep a right-aligned target in bounds in landscape, where the window excludes the cutout inset', () => {
        // The settled position of the Switch button after rotating to landscape. Its right edge is
        // 842.28, comfortably inside the 862.48 window, so the tooltip must stay visible. Counting the
        // right inset a second time pushed this to 894.09 and wrongly hid the tooltip.
        const bounds = {x: 772.952392578125, y: 122.66667175292969, width: 69.33331298828125, height: 27.80950927734375};

        expect(isTooltipTargetOutOfBounds(bounds, LANDSCAPE_INSETS, LANDSCAPE_WINDOW)).toBe(false);
    });

    it('should shift the target by the left inset so it shares the window origin', () => {
        // Same element, but with the cutout on the left: x is measured from the edge that includes the
        // inset, so it reads 51.81 higher and must be shifted back to compare against the window.
        const insetsOnLeft: EdgeInsets = {top: 28.190475463867188, right: 0, bottom: 24, left: 51.80952453613281};
        const bounds = {x: 772.952392578125 + 51.80952453613281, y: 122.66667175292969, width: 69.33331298828125, height: 27.80950927734375};

        expect(isTooltipTargetOutOfBounds(bounds, insetsOnLeft, LANDSCAPE_WINDOW)).toBe(false);
    });
});
