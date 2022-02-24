function integerPropType(props, propName, componentName) {
    const propValue = props[propName];
    if (!Number.isInteger(propValue)) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. Must be an integer, but got ${propValue} instead`);
    }
}

function wholeNumberPropType(props, propName, componentName) {
    const propValue = props[propName];
    if (!Number.isInteger(propValue) || propValue < 0) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. Must be a whole number, but got ${propValue} instead`);
    }
}

export {
    integerPropType,
    wholeNumberPropType,
};
