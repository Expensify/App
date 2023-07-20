import getBaseNavigationModalCardStyles from './getBaseNavigationModalCardStyles';

export default ({windowHeight, isSmallScreenWidth}) => ({
    ...getBaseNavigationModalCardStyles({isSmallScreenWidth}),

    // This height is passed from JavaScript, instead of using CSS expressions like "100%" or "100vh", to work around
    // Safari issues:
    // https://github.com/Expensify/App/issues/12005
    // https://github.com/Expensify/App/issues/17824
    // https://github.com/Expensify/App/issues/20709

    height: `${windowHeight}px`,
    minHeight: `${windowHeight}px`,
});
