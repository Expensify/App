/** The single RHP width a drag writes, kept in a CSS variable so styles follow it without a React render. */
import variables from '@styles/variables';

import type {DimensionValue} from 'react-native';

import lodashClamp from 'lodash/clamp';

const SINGLE_RHP_WIDTH_VARIABLE = '--rhp-width';

/** The live single RHP width as a CSS expression. A drag rewrites the variable, so every style built on it follows without a React render. */
const SINGLE_RHP_WIDTH_CSS = `var(${SINGLE_RHP_WIDTH_VARIABLE}, ${variables.rhpWidth}px)`;

/** The width the user dragged to, kept apart from the shown width so a window that shrinks and grows back restores it. */
let preferredSingleRHPWidth: number = variables.rhpWidth;

let shownSingleRHPWidth: number = variables.rhpWidth;

function getSingleRHPWidth(): number {
    return shownSingleRHPWidth;
}

function showSingleRHPWidth(width: number) {
    shownSingleRHPWidth = width;
    document.documentElement.style.setProperty(SINGLE_RHP_WIDTH_VARIABLE, `${width}px`);
}

function applySingleRHPWidth(width: number) {
    preferredSingleRHPWidth = width;
    showSingleRHPWidth(width);
}

/** Fits the preferred width into the current bounds without forgetting it. */
function clampSingleRHPWidth(min: number, max: number) {
    showSingleRHPWidth(lodashClamp(preferredSingleRHPWidth, min, max));
}

/** react-native-web passes a string width through to CSS verbatim. */
function getSingleRHPWidthStyleValue(offset: number): DimensionValue {
    // DimensionValue has no member for CSS functions, which react-native-web still renders as written.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return `calc(${SINGLE_RHP_WIDTH_CSS} + ${offset}px)` as DimensionValue;
}

export {applySingleRHPWidth, clampSingleRHPWidth, getSingleRHPWidth, getSingleRHPWidthStyleValue};
