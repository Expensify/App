"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var CONST_1 = require("@src/CONST");
function HelpBulletList(_a) {
    var items = _a.items, styles = _a.styles;
    return items.map(function (item, index) { return (<react_native_1.View 
    // eslint-disable-next-line react/no-array-index-key
    key={"bullet-list-item-".concat(index)} style={[styles.flexRow, styles.alignItemsStart, styles.mt3]}>
            <Text_1.default style={[styles.textNormal, styles.pr2, styles.userSelectNone]}>{CONST_1.default.DOT_SEPARATOR}</Text_1.default>
            <react_native_1.View style={[styles.flex1]}>{item}</react_native_1.View>
        </react_native_1.View>); });
}
exports.default = HelpBulletList;
