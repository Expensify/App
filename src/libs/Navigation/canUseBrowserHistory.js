import _ from 'underscore';
import lodashGet from 'lodash/get';
import {Dimensions} from 'react-native';
import variables from '../../styles/variables';

/**
 * @returns {Boolean}
 */
function canUseBrowserHistory() {
    const isSmallScreenWidth = Dimensions.get('window').width <= variables.mobileResponsiveWidthBreakpoint;
    return !_.isUndefined(lodashGet(window, 'history')) && !isSmallScreenWidth;
}

export default canUseBrowserHistory;
