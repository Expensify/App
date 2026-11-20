import type {DimensionValue} from 'react-native';

function getSingleRHPWidthStyleValue(width: number, offset: number): DimensionValue {
    return width + offset;
}

// eslint-disable-next-line import/prefer-default-export -- Must stay a named export to match the web variant, which exports more than one value.
export {getSingleRHPWidthStyleValue};
