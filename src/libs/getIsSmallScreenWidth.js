'use strict';
exports.__esModule = true;
var react_native_1 = require('react-native');
var variables_1 = require('@styles/variables');
function getIsSmallScreenWidth(windowWidth) {
    if (windowWidth === void 0) {
        windowWidth = react_native_1.Dimensions.get('window').width;
    }
    return windowWidth <= variables_1['default'].mobileResponsiveWidthBreakpoint;
}
exports['default'] = getIsSmallScreenWidth;
