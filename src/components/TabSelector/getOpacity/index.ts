import type GetOpacity from './types';

const getOpacity: GetOpacity = ({routesLength, tabIndex, active, affectedTabs, isActive}) => {
    const activeValue = active ? 1 : 0;
    const inactiveValue = active ? 0 : 1;

    if (routesLength > 1) {
        return affectedTabs.includes(tabIndex) && isActive ? activeValue : inactiveValue;
    }
    return activeValue;
};

export default getOpacity;
