
exports.__esModule = true;
const react_native_1 = require('react-native');
const variables_1 = require('@styles/variables');

function getIsSmallScreenWidth(windowWidth) {
    if (windowWidth === void 0) {
        windowWidth = react_native_1.Dimensions.get('window').width;
    }
    return windowWidth <= variables_1['default'].mobileResponsiveWidthBreakpoint;
}
exports['default'] = getIsSmallScreenWidth;
