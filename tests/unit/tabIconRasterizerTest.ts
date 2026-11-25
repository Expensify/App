import {getAccessoryWidth, getTabIconFrame} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import type {TabIconLayout} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';

import variables from '@styles/variables';

// jest/setup.ts mocks the rasterizer for every hook that draws tab icons, and the frame maths needs the real module.
jest.unmock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer');

const GLYPH_SIZE = 24;
const ICON_BOX_SIZE = 28;
const ACCESSORY_WIDTH = 16;
const LABEL_GAP = 2;
const LABEL_WIDTH = 30;
const LABEL_HEIGHT = 12;
const SCALE = 1;

const STACKED_LAYOUT: TabIconLayout = {glyphSize: GLYPH_SIZE, iconBoxSize: ICON_BOX_SIZE, direction: 'stacked'};
const INLINE_LAYOUT: TabIconLayout = {glyphSize: GLYPH_SIZE, iconBoxSize: ICON_BOX_SIZE, direction: 'inline'};

describe('getTabIconFrame', () => {
    it('should keep the glyph centered over its label when an accessory widens a stacked icon', () => {
        // Given a stacked tab with a label and an accessory beside its glyph, as the More item of the iOS 26 bar
        const accessoryWidth = ACCESSORY_WIDTH;

        // When its frame is laid out
        const frame = getTabIconFrame(STACKED_LAYOUT, GLYPH_SIZE, accessoryWidth, LABEL_GAP, LABEL_WIDTH, LABEL_HEIGHT, true, SCALE);

        // Then the canvas makes room for the accessory on both sides, so the glyph stays in the middle of the bar item,
        // centered over the label like every other tab
        expect(frame.canvasWidth).toBe(GLYPH_SIZE + 2 * ACCESSORY_WIDTH);
        expect(frame.contentLeft + GLYPH_SIZE / 2).toBe(frame.canvasWidth / 2);
        expect(frame.labelLeft + LABEL_WIDTH / 2).toBe(frame.canvasWidth / 2);
    });

    it('should frame a stacked icon with no accessory as wide as its glyph or label', () => {
        // Given a stacked tab with a label and no accessory, as every item but More, or More over a corner accessory
        const accessoryWidth = 0;

        // When its frame is laid out
        const frame = getTabIconFrame(STACKED_LAYOUT, GLYPH_SIZE, accessoryWidth, LABEL_GAP, LABEL_WIDTH, LABEL_HEIGHT, true, SCALE);

        // Then the canvas is as wide as the wider of the two, so the icon is not widened for an accessory it does not draw
        expect(frame.canvasWidth).toBe(Math.max(GLYPH_SIZE, LABEL_WIDTH));
    });

    it('should move the label of an inline icon past its accessory', () => {
        // Given an inline tab with a label and an accessory beside its glyph, as the More item in iOS 26 landscape
        const accessoryWidth = ACCESSORY_WIDTH;

        // When its frame is laid out
        const frame = getTabIconFrame(INLINE_LAYOUT, GLYPH_SIZE, accessoryWidth, LABEL_GAP, LABEL_WIDTH, LABEL_HEIGHT, true, SCALE);

        // Then the glyph keeps the box every tab gives it and the label starts after the accessory, so the two never overlap
        expect(frame.contentLeft).toBe((ICON_BOX_SIZE - GLYPH_SIZE) / 2);
        expect(frame.labelLeft).toBe(ICON_BOX_SIZE + ACCESSORY_WIDTH + LABEL_GAP);
        expect(frame.canvasWidth).toBe(ICON_BOX_SIZE + ACCESSORY_WIDTH + LABEL_GAP + LABEL_WIDTH);
    });

    it('should widen an inline icon with no label by its accessory alone', () => {
        // Given an inline tab with no label and an accessory beside its glyph
        const accessoryWidth = ACCESSORY_WIDTH;

        // When its frame is laid out
        const frame = getTabIconFrame(INLINE_LAYOUT, GLYPH_SIZE, accessoryWidth, LABEL_GAP, 0, 0, false, SCALE);

        // Then the canvas holds the glyph and the accessory only, with no room left for a label gap
        expect(frame.canvasWidth).toBe(GLYPH_SIZE + ACCESSORY_WIDTH);
    });

    it('should frame an icon with its accessory at the pill edge as wide as the pill', () => {
        // Given the Android More item, whose chevron sits at the right edge of a pill wider than the glyph, with no label
        const pillWidth = variables.androidNativeTabBarActiveIndicatorWidth;
        const layout: TabIconLayout = {glyphSize: GLYPH_SIZE, iconBoxSize: GLYPH_SIZE, direction: 'stacked', accessoryPlacement: 'pillEdge', pillWidth};

        // When its frame is laid out
        const frame = getTabIconFrame(layout, GLYPH_SIZE, getAccessoryWidth(layout, GLYPH_SIZE, SCALE), 0, 0, 0, false, SCALE);

        // Then the icon spans the pill with the glyph in its middle, so the glyph stays where every other item draws its own
        expect(frame.canvasWidth).toBe(pillWidth);
        expect(frame.contentLeft + GLYPH_SIZE / 2).toBe(pillWidth / 2);
    });
});
