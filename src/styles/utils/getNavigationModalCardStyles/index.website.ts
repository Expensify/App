// eslint-disable-next-line no-restricted-imports
import positioning from '@styles/utils/positioning';
import type GetNavigationModalCardStyles from './types';

const getNavigationModalCardStyles: GetNavigationModalCardStyles = () => ({
    // position: fixed is set instead of position absolute to workaround Safari known issues of updating heights in DOM.
    // Safari issues:
    // https://github.com/Expensify/App/issues/12005
    // https://github.com/Expensify/App/issues/17824
    // https://github.com/Expensify/App/issues/20709
    width: '100%',
    height: '100%',

    ...positioning.pFixed,
});

export default getNavigationModalCardStyles;
