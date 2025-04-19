'use strict';
exports.__esModule = true;
var NAVIGATORS_1 = require('@src/NAVIGATORS');
function isSideModalNavigator(targetNavigator) {
    return targetNavigator === NAVIGATORS_1['default'].LEFT_MODAL_NAVIGATOR || targetNavigator === NAVIGATORS_1['default'].RIGHT_MODAL_NAVIGATOR;
}
exports['default'] = isSideModalNavigator;
