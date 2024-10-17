import type GetOpacity from './types';

const getOpacity: GetOpacity = ({routesLength, tabIndex, active, affectedTabs, position, isActive}) => {
    const activeValue = active ? 1 : 0;
    const inactiveValue = active ? 0 : 1;

    if (routesLength > 1) {
        const inputRange = Array.from({length: routesLength}, (v, i) => i);

        return position?.interpolate({
            inputRange,
            outputRange: inputRange.map((i) => (affectedTabs.includes(tabIndex) && i === tabIndex && isActive ? activeValue : inactiveValue)),
        });
    }
    return activeValue;
};

export default getOpacity;
