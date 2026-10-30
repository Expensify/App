/** The single RHP width a drag paints straight onto the DOM, ahead of React, as a CSS variable that styles fall back from. */
import type {DimensionValue} from 'react-native';

const SINGLE_RHP_WIDTH_VARIABLE = '--rhp-width';

/** `scope` must contain every element whose style reads the width: the RHP cards and the handle. */
function writeLiveSingleRHPWidth(scope: HTMLElement | null, width: number) {
    scope?.style.setProperty(SINGLE_RHP_WIDTH_VARIABLE, `${width}px`);
}

function clearLiveSingleRHPWidth(scope: HTMLElement | null) {
    scope?.style.removeProperty(SINGLE_RHP_WIDTH_VARIABLE);
}

/** The live width mid-drag, the committed `width` otherwise. */
function getSingleRHPWidthStyleValue(width: number, offset: number): DimensionValue {
    // DimensionValue has no member for CSS functions, which react-native-web still renders as written.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return `calc(var(${SINGLE_RHP_WIDTH_VARIABLE}, ${width}px) + ${offset}px)` as DimensionValue;
}

export {clearLiveSingleRHPWidth, getSingleRHPWidthStyleValue, writeLiveSingleRHPWidth};
