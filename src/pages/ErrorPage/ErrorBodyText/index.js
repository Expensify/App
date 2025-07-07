"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function ErrorBodyText() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {"".concat(translate('genericErrorPage.body.helpTextMobile'), " ")}
            <TextLink_1.default href={CONST_1.default.NEW_EXPENSIFY_URL} style={[styles.link]}>
                {translate('genericErrorPage.body.helpTextWeb')}
            </TextLink_1.default>
        </Text_1.default>);
}
ErrorBodyText.displayName = 'ErrorBodyText';
exports.default = ErrorBodyText;
