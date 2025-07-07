"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ActionableItemButtons(props) {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[props.layout === 'horizontal' ? styles.flexRow : [styles.flexColumn, styles.alignItemsStart], styles.gap2, styles.mt2]}>
            {(_a = props.items) === null || _a === void 0 ? void 0 : _a.map(function (item) { return (<Button_1.default key={item.key} onPress={item.onPress} text={props.shouldUseLocalization ? translate(item.text) : item.text} medium success={item.isPrimary}/>); })}
        </react_native_1.View>);
}
ActionableItemButtons.displayName = 'ActionableItemButtons';
exports.default = ActionableItemButtons;
