"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
function TextWithTooltip(_a) {
    var text = _a.text, shouldShowTooltip = _a.shouldShowTooltip, style = _a.style, _b = _a.numberOfLines, numberOfLines = _b === void 0 ? 1 : _b;
    var _c = (0, react_1.useState)(false), showTooltip = _c[0], setShowTooltip = _c[1];
    return (<Tooltip_1.default shouldRender={showTooltip} text={text}>
            <Text_1.default style={style} numberOfLines={numberOfLines} onLayout={function (e) {
            var target = e.nativeEvent.target;
            if (!shouldShowTooltip) {
                return;
            }
            if (target.scrollWidth > target.offsetWidth) {
                setShowTooltip(true);
                return;
            }
            setShowTooltip(false);
        }}>
                {text}
            </Text_1.default>
        </Tooltip_1.default>);
}
TextWithTooltip.displayName = 'TextWithTooltip';
exports.default = TextWithTooltip;
