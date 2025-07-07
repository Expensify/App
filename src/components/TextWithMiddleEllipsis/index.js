"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useTextWithMiddleEllipsis_1 = require("@hooks/useTextWithMiddleEllipsis");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function TextWithMiddleEllipsis(_a) {
    var text = _a.text, style = _a.style, textStyle = _a.textStyle;
    var styles = (0, useThemeStyles_1.default)();
    var ref = (0, react_1.useRef)(null);
    var displayText = (0, useTextWithMiddleEllipsis_1.default)({
        text: text,
        ref: ref,
    });
    return (<react_native_1.View style={[style, styles.flexShrink1, styles.textWithMiddleEllipsisContainer]}>
            <Text_1.default style={[textStyle, styles.textWithMiddleEllipsisText]} numberOfLines={1} ref={ref}>
                {displayText}
            </Text_1.default>
        </react_native_1.View>);
}
exports.default = TextWithMiddleEllipsis;
