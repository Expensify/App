"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var Parser_1 = require("@libs/Parser");
var StringUtils_1 = require("@libs/StringUtils");
// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames(_a) {
    var accessibilityLabel = _a.accessibilityLabel, fullTitle = _a.fullTitle, _b = _a.textStyles, textStyles = _b === void 0 ? [] : _b, _c = _a.numberOfLines, numberOfLines = _c === void 0 ? 1 : _c, renderAdditionalText = _a.renderAdditionalText;
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default accessibilityLabel={accessibilityLabel} style={textStyles} numberOfLines={numberOfLines} testID={DisplayNames.displayName}>
            {StringUtils_1.default.lineBreaksToSpaces(Parser_1.default.htmlToText(fullTitle)) || translate('common.hidden')}
            {renderAdditionalText === null || renderAdditionalText === void 0 ? void 0 : renderAdditionalText()}
        </Text_1.default>);
}
DisplayNames.displayName = 'DisplayNames';
exports.default = DisplayNames;
