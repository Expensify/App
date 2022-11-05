import getBaseNavigationModalCardStyles from './getBaseNavigationModalCardStyles';

export default isSmallScreenWidth => ({
    ...getBaseNavigationModalCardStyles(isSmallScreenWidth),
    height: 'calc(100vh - 100%)',
});
