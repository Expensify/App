/** The single RHP width a drag paints straight onto the DOM, ahead of React, as a CSS variable that styles fall back from. */
import {toDimensionValue} from '@libs/WebOnlyStyleUtils';

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
    return toDimensionValue(`calc(var(${SINGLE_RHP_WIDTH_VARIABLE}, ${width}px) + ${offset}px)`);
}

export {clearLiveSingleRHPWidth, getSingleRHPWidthStyleValue, writeLiveSingleRHPWidth};
