import * as NumberUtils from './NumberUtils';

function integerPropType(props, propName, componentName) {
    const propValue = props[propName];
    if (!Number.isInteger(propValue)) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. Must be an integer, but got ${propValue} instead`);
    }
}

function wholeNumberPropType(props, propName, componentName) {
    const propValue = props[propName];
    if (!NumberUtils.isWholeNumber(propValue)) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. Must be a whole number, but got ${propValue} instead`);
    }
}

export {
    integerPropType,
    wholeNumberPropType,
};
