import type CONST from '@src/CONST';
import createThemeStyles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import createStyleUtils from '@src/styles/utils';
import variables from '@src/styles/variables';

jest.mock('@libs/getPlatform', () => () => jest.requireActual<{default: typeof CONST}>('@src/CONST').default.PLATFORM.IOS);

const {getPlatformSafeAreaPadding} = createStyleUtils(defaultTheme, createThemeStyles(defaultTheme));

// The width of the iPhone Duo's vertical bar, which the window reports as its side inset
const VERTICAL_BAR_INSET = 84;
const insets = {top: 0, right: VERTICAL_BAR_INSET, bottom: 34, left: 0};

describe('getPlatformSafeAreaPadding', () => {
    it('trims the side insets on an iPhone without a vertical bar', () => {
        // Given an iPhone whose side inset is its notch, which leaves room for content beside it
        const hasVerticalBar = false;

        // When the padding for its insets is computed
        const padding = getPlatformSafeAreaPadding(insets, {hasVerticalBar});

        // Then the side inset is trimmed like the bottom one, so the content keeps its usual width
        expect(padding.paddingRight).toBeCloseTo(VERTICAL_BAR_INSET * variables.iosSafeAreaInsetsPercentage);
        expect(padding.paddingBottom).toBeCloseTo(insets.bottom * variables.iosSafeAreaInsetsPercentage);
    });

    it('keeps the whole side inset on a foldable iPhone with a vertical bar', () => {
        // Given a foldable iPhone whose side inset is the vertical bar, which the status bar and bar items fill
        const hasVerticalBar = true;

        // When the padding for its insets is computed
        const padding = getPlatformSafeAreaPadding(insets, {hasVerticalBar});

        // Then the side padding covers the whole bar, so content such as a modal's full-width image stays out from under it
        expect(padding.paddingRight).toBe(VERTICAL_BAR_INSET);
        expect(padding.paddingLeft).toBe(0);

        // And the bottom inset, which is the home indicator, is still trimmed as before
        expect(padding.paddingBottom).toBeCloseTo(insets.bottom * variables.iosSafeAreaInsetsPercentage);
    });
});
