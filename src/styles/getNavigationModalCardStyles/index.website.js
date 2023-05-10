import getBaseNavigationModalCardStyles from './getBaseNavigationModalCardStyles';

export default isSmallScreenWidth => ({
    ...getBaseNavigationModalCardStyles(isSmallScreenWidth),

    // This makes the modal card take up the full height of the screen on Desktop Safari and iOS Safari
    // https://github.com/Expensify/App/pull/12509/files#r1018107162
    height: 'calc(100vh - 100%)',
});
