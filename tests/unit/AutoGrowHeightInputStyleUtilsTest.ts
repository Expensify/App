import createThemeStyles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import createStyleUtils from '@src/styles/utils';
import variables from '@src/styles/variables';

import type {ViewStyle} from 'react-native';

import {StyleSheet} from 'react-native';

const mockStyles = createThemeStyles(defaultTheme);
const {getAutoGrowHeightInputStyle, getAutoGrowHeightInputVerticalInset} = createStyleUtils(defaultTheme, mockStyles);

const maxHeight = variables.textInputAutoGrowMaxHeight;

/**
 * Rebuilds the container style tree that BaseTextInput hands to the helper. `pb1` is always applied to an
 * autoGrowHeight input because it is multiline, and `pt0` is only applied when there is no label.
 */
function getContainerStyle(hasLabel: boolean, overrides?: ViewStyle) {
    return StyleSheet.flatten([mockStyles.textInputContainer, !hasLabel && mockStyles.pt0, overrides, mockStyles.pb1]);
}

describe('getAutoGrowHeightInputVerticalInset', () => {
    it('counts the borders, the container padding and the multiline label padding', () => {
        // borders (1 * 2) + paddingTop (8) + paddingBottom (4) + label padding
        expect(getAutoGrowHeightInputVerticalInset(getContainerStyle(true), true)).toBe(14 + variables.inputPaddingTop);
    });

    it('skips the label padding when there is no label', () => {
        // borders (1 * 2) + paddingTop (0, from pt0) + paddingBottom (4)
        expect(getAutoGrowHeightInputVerticalInset(getContainerStyle(false), false)).toBe(6);
    });

    it('honours a padding override coming from textInputContainerStyles', () => {
        expect(getAutoGrowHeightInputVerticalInset(getContainerStyle(true, mockStyles.p0), true)).toBe(6 + variables.inputPaddingTop);
    });

    it('ignores non numeric values', () => {
        expect(getAutoGrowHeightInputVerticalInset({padding: '10%', borderWidth: 1}, false)).toBe(2);
    });
});

describe('getAutoGrowHeightInputStyle', () => {
    it('sizes the growing input so it matches the height it gets after the overflow flip', () => {
        const verticalInset = getAutoGrowHeightInputVerticalInset(getContainerStyle(true), true);

        // The input never scrolls while it is growing, so its fixed height has to be the full container height minus
        // everything its ancestors take up. Otherwise the box resizes at the flip and the scroll offset stops short.
        expect(getAutoGrowHeightInputStyle(maxHeight, maxHeight, verticalInset)).toEqual(expect.objectContaining({height: maxHeight - verticalInset}));
    });

    it('keeps the content of the tallest pre flip input within the fixed height', () => {
        const verticalInset = getAutoGrowHeightInputVerticalInset(getContainerStyle(true), true);
        // The hidden measurement carries the input padding, so the flip happens once `inputPaddingTop + 8 + lineHeight * lines` passes maxHeight.
        const linesBeforeFlip = Math.floor((maxHeight - variables.inputPaddingTop - 8) / variables.lineHeightXLarge);

        expect(linesBeforeFlip * variables.lineHeightXLarge).toBeLessThanOrEqual(maxHeight - verticalInset);
    });

    it('drops the fixed height and scrolls once the content passes the max height', () => {
        const style = getAutoGrowHeightInputStyle(maxHeight + 1, maxHeight, 29);

        expect(style.height).toBeUndefined();
        expect(style.overflow).toBe(mockStyles.overflowAuto.overflow);
    });
});
