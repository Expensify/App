import type {DimensionValue} from 'react-native';

/** The RHP is full-screen on native, so nothing drags its width. */
function writeLiveSingleRHPWidth() {}

function clearLiveSingleRHPWidth() {}

function getSingleRHPWidthStyleValue(width: number, offset: number): DimensionValue {
    return width + offset;
}

export {clearLiveSingleRHPWidth, getSingleRHPWidthStyleValue, writeLiveSingleRHPWidth};
