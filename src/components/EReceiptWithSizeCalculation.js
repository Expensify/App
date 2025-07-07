"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var EReceipt_1 = require("./EReceipt");
function EReceiptWithSizeCalculation(props) {
    var _a = (0, react_1.useState)(0), scaleFactor = _a[0], setScaleFactor = _a[1];
    var styles = (0, useThemeStyles_1.default)();
    var onLayout = function (e) {
        var width = e.nativeEvent.layout.width;
        setScaleFactor(width / variables_1.default.eReceiptBGHWidth);
    };
    return scaleFactor ? (<react_native_1.View style={[styles.overflowHidden, styles.w100, styles.h100, styles.userSelectNone]}>
            <react_native_1.View onLayout={onLayout} 
    // We are applying transform of 0 translateZ to avoid a sub-pixel rendering error of a thin 1px line
    // appearing on EReceipts on web, specifically in chrome. More details in https://github.com/Expensify/App/pull/59944#issuecomment-2797249923.
    style={[styles.w100, styles.h100, { transform: "scale(".concat(scaleFactor, ") ").concat(styles.translateZ0.transform), transformOrigin: 'top left' }]}>
                <EReceipt_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} isThumbnail/>
            </react_native_1.View>
        </react_native_1.View>) : (<react_native_1.View style={[styles.w100, styles.h100]} onLayout={onLayout}/>);
}
EReceiptWithSizeCalculation.displayName = 'EReceiptWithSizeCalculation';
exports.default = EReceiptWithSizeCalculation;
