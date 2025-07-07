"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ControlSelection_1 = require("@libs/ControlSelection");
var Button_1 = require("./Button");
var Expensicons = require("./Icon/Expensicons");
var padNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '<'],
];
function BigNumberPad(_a) {
    var numberPressed = _a.numberPressed, _b = _a.longPressHandlerStateChanged, longPressHandlerStateChanged = _b === void 0 ? function () { } : _b, _c = _a.id, id = _c === void 0 ? 'numPadView' : _c, _d = _a.isLongPressDisabled, isLongPressDisabled = _d === void 0 ? false : _d;
    var toLocaleDigit = (0, useLocalize_1.default)().toLocaleDigit;
    var styles = (0, useThemeStyles_1.default)();
    var _e = (0, react_1.useState)(null), timer = _e[0], setTimer = _e[1];
    var isExtraSmallScreenHeight = (0, useResponsiveLayout_1.default)().isExtraSmallScreenHeight;
    var numberPressedRef = (0, react_1.useRef)(numberPressed);
    (0, react_1.useEffect)(function () {
        numberPressedRef.current = numberPressed;
    }, [numberPressed]);
    /**
     * Handle long press key on number pad.
     * Only handles the '<' key and starts the continuous input timer.
     */
    var handleLongPress = function (key) {
        if (key !== '<') {
            return;
        }
        longPressHandlerStateChanged(true);
        var newTimer = setInterval(function () {
            var _a;
            (_a = numberPressedRef.current) === null || _a === void 0 ? void 0 : _a.call(numberPressedRef, key);
        }, 100);
        setTimer(newTimer);
    };
    return (<react_native_1.View style={[styles.flexColumn, styles.w100]} id={id}>
            {padNumbers.map(function (row) { return (<react_native_1.View key={"NumberPadRow-".concat(row[0])} style={[styles.flexRow, styles.mt3]}>
                    {row.map(function (column, columnIndex) {
                // Adding margin between buttons except first column to
                // avoid unnecessary space before the first column.
                var marginLeft = columnIndex > 0 ? styles.ml3 : {};
                return (<Button_1.default key={column} medium={isExtraSmallScreenHeight} large={!isExtraSmallScreenHeight} shouldEnableHapticFeedback style={[styles.flex1, marginLeft]} text={column === '<' ? undefined : toLocaleDigit(column)} icon={column === '<' ? Expensicons.BackArrow : undefined} onLongPress={function () { return handleLongPress(column); }} onPress={function () { return numberPressed(column); }} onPressIn={ControlSelection_1.default.block} onPressOut={function () {
                        if (timer) {
                            clearInterval(timer);
                        }
                        ControlSelection_1.default.unblock();
                        longPressHandlerStateChanged(false);
                    }} onMouseDown={function (e) {
                        e.preventDefault();
                    }} isLongPressDisabled={isLongPressDisabled} testID={"button_".concat(column)}/>);
            })}
                </react_native_1.View>); })}
        </react_native_1.View>);
}
BigNumberPad.displayName = 'BigNumberPad';
exports.default = BigNumberPad;
