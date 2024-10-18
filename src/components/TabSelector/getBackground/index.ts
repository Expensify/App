import type GetBackgroudColor from './types';

const getBackgroundColor: GetBackgroudColor = ({routesLength, tabIndex, affectedTabs, theme, isActive}) => {
    if (routesLength > 1) {
        return affectedTabs.includes(tabIndex) && isActive ? theme.border : theme.appBG;
    }
    return theme.border;
};
export default getBackgroundColor;
