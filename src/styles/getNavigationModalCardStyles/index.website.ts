import {ViewStyle} from 'react-native';
import GetNavigationModalCardStyles from './types';

const getNavigationModalCardStyles: GetNavigationModalCardStyles = () => ({
    // position: fixed is set instead of position absolute to workaround Safari known issues of updating heights in DOM.
    // Safari issues:
    // https://github.com/Expensify/App/issues/12005
    // https://github.com/Expensify/App/issues/17824
    // https://github.com/Expensify/App/issues/20709
    width: '100%',
    height: '100%',

    // NOTE: asserting "position" to a valid type, because isn't possible to augment "position".
    position: 'fixed' as ViewStyle['position'],
});

export default getNavigationModalCardStyles;
