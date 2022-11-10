import getBaseNavigationModalCardStyles from './getBaseNavigationModalCardStyles';

export default isSmallScreenWidth => ({
    ...getBaseNavigationModalCardStyles(isSmallScreenWidth),

    // This makes the modal card take up the full height of the screen on Desktop Safari and iOS Safari avoiding bottom navigation bar.
    height: 'calc(100vh - 100%)',
});
