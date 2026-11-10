/** The single RHP width a drag paints straight onto the DOM, ahead of React, as a CSS variable that styles fall back from. */
import type {DimensionValue} from 'react-native';

const SINGLE_RHP_WIDTH_VARIABLE = '--rhp-width';

/** On the document root, so modals portaled over the RHP follow the drag along with the RHP's own cards. */
function writeLiveSingleRHPWidth(width: number) {
    document.documentElement.style.setProperty(SINGLE_RHP_WIDTH_VARIABLE, `${width}px`);
}

function clearLiveSingleRHPWidth() {
    document.documentElement.style.removeProperty(SINGLE_RHP_WIDTH_VARIABLE);
}

/** The live width mid-drag, the committed `width` otherwise. */
function getSingleRHPWidthStyleValue(width: number, offset: number): DimensionValue {
    // DimensionValue has no member for CSS functions, which react-native-web still renders as written.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return `calc(var(${SINGLE_RHP_WIDTH_VARIABLE}, ${width}px) + ${offset}px)` as DimensionValue;
}

export {clearLiveSingleRHPWidth, getSingleRHPWidthStyleValue, writeLiveSingleRHPWidth};
