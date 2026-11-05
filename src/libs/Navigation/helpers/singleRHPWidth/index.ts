/** The single RHP width a drag paints straight onto the DOM, ahead of React, as a CSS variable that styles fall back from. */
import createLiveSizeVariable from '@libs/Navigation/helpers/createLiveSizeVariable';

const singleRHPWidthVariable = createLiveSizeVariable('--rhp-width');

const writeLiveSingleRHPWidth = singleRHPWidthVariable.write;

const clearLiveSingleRHPWidth = singleRHPWidthVariable.clear;

/** The live width mid-drag, the committed `width` otherwise. */
const getSingleRHPWidthStyleValue = singleRHPWidthVariable.getStyleValue;

export {clearLiveSingleRHPWidth, getSingleRHPWidthStyleValue, writeLiveSingleRHPWidth};
