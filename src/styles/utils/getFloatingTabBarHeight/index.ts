import variables from '@styles/variables';

function getFloatingTabBarHeight(isInLandscapeMode: boolean): number {
    return isInLandscapeMode ? variables.floatingTabBarLandscapeHeight : variables.floatingTabBarHeight;
}

export default getFloatingTabBarHeight;
