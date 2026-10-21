import variables from '@styles/variables';

import type {DimensionValue} from 'react-native';

/** The RHP is full-screen on native, so its width never changes. */
function getSingleRHPWidth(): number {
    return variables.rhpWidth;
}

function applySingleRHPWidth() {}

function clampSingleRHPWidth() {}

function getSingleRHPWidthStyleValue(offset: number): DimensionValue {
    return variables.rhpWidth + offset;
}

export {applySingleRHPWidth, clampSingleRHPWidth, getSingleRHPWidth, getSingleRHPWidthStyleValue};
