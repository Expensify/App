"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function NextStepEmailRenderer(_a) {
    var tnode = _a.tnode;
    var styles = (0, useThemeStyles_1.default)();
    return (<Text_1.default testID="email-with-break-opportunities" style={[styles.breakWord, styles.textLabelSupporting, styles.textStrong]}>
            {'data' in tnode ? tnode.data : ''}
        </Text_1.default>);
}
NextStepEmailRenderer.displayName = 'NextStepEmailRenderer';
exports.default = NextStepEmailRenderer;
