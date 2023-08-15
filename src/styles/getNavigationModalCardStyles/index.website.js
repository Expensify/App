import getBaseNavigationModalCardStyles from './getBaseNavigationModalCardStyles';

export default ({isSmallScreenWidth}) => ({
    ...getBaseNavigationModalCardStyles({isSmallScreenWidth}),

    // position: fixed is set instead of position absolute to workaround Safari known issues of updating heights in DOM.
    // Safari issues:
    // https://github.com/Expensify/App/issues/12005
    // https://github.com/Expensify/App/issues/17824
    // https://github.com/Expensify/App/issues/20709
    position: 'fixed',
});
