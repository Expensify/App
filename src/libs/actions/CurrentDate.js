'use strict';
exports.__esModule = true;
exports.setCurrentDate = void 0;
var react_native_onyx_1 = require('react-native-onyx');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
function setCurrentDate(currentDate) {
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].CURRENT_DATE, currentDate);
}
exports.setCurrentDate = setCurrentDate;
