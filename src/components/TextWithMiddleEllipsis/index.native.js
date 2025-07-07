"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
function TextWithMiddleEllipsis(_a) {
    var text = _a.text, style = _a.style, textStyle = _a.textStyle;
    return (<Text_1.default style={[style, textStyle]} ellipsizeMode="middle" numberOfLines={1}>
            {text}
        </Text_1.default>);
}
TextWithMiddleEllipsis.displayName = 'TextWithMiddleEllipsis';
exports.default = TextWithMiddleEllipsis;
