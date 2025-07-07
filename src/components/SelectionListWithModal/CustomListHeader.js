"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function CustomListHeader(_a) {
    var canSelectMultiple = _a.canSelectMultiple, _b = _a.leftHeaderText, leftHeaderText = _b === void 0 ? '' : _b, _c = _a.rightHeaderText, rightHeaderText = _c === void 0 ? '' : _c, _d = _a.rightHeaderMinimumWidth, rightHeaderMinimumWidth = _d === void 0 ? 60 : _d;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var header = (<react_native_1.View style={[
            styles.flex1,
            styles.flexRow,
            styles.justifyContentBetween,
            // Required padding accounting for the checkbox in multi-select mode
            canSelectMultiple && styles.pl3,
        ]}>
            <Text_1.default style={styles.textMicroSupporting}>{leftHeaderText}</Text_1.default>
            <react_native_1.View style={[StyleUtils.getMinimumWidth(rightHeaderMinimumWidth)]}>
                <Text_1.default style={[styles.textMicroSupporting, styles.textAlignCenter]}>{rightHeaderText}</Text_1.default>
            </react_native_1.View>
        </react_native_1.View>);
    if (canSelectMultiple) {
        return header;
    }
    return <react_native_1.View style={[styles.flexRow, styles.ph9, styles.pv3, styles.pb5]}>{header}</react_native_1.View>;
}
exports.default = CustomListHeader;
