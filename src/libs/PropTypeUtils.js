import * as NumberUtils from './NumberUtils';

function wholeNumberPropType(props, propName, componentName) {
    const propValue = props[propName];
    if (!NumberUtils.isWholeNumber(propValue)) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. Must be a whole number, but got ${propValue} instead`);
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    wholeNumberPropType,
};
