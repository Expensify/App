"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Text_1 = require("./Text");
function BulletList(_a) {
    var items = _a.items, header = _a.header;
    var styles = (0, useThemeStyles_1.default)();
    var baseTextStyles = [styles.mutedNormalTextLabel];
    var renderBulletListHeader = function () {
        if (typeof header === 'string') {
            return <Text_1.default style={baseTextStyles}>{header}</Text_1.default>;
        }
        return header;
    };
    var renderBulletPoint = function (item) {
        return (<Text_1.default style={baseTextStyles} key={item}>
                <Text_1.default style={[styles.ph2, baseTextStyles]}>•</Text_1.default>
                {item}
            </Text_1.default>);
    };
    return (<react_native_1.View style={[styles.w100, styles.mt2]}>
            {renderBulletListHeader()}
            <react_native_1.View>{items.map(function (item) { return renderBulletPoint(item); })}</react_native_1.View>
        </react_native_1.View>);
}
BulletList.displayName = 'BulletList';
exports.default = BulletList;
