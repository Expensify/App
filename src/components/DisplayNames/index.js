"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var Parser_1 = require("@libs/Parser");
var StringUtils_1 = require("@libs/StringUtils");
var DisplayNamesWithoutTooltip_1 = require("./DisplayNamesWithoutTooltip");
var DisplayNamesWithTooltip_1 = require("./DisplayNamesWithTooltip");
function DisplayNames(_a) {
    var fullTitle = _a.fullTitle, tooltipEnabled = _a.tooltipEnabled, textStyles = _a.textStyles, numberOfLines = _a.numberOfLines, shouldAddEllipsis = _a.shouldAddEllipsis, shouldUseFullTitle = _a.shouldUseFullTitle, displayNamesWithTooltips = _a.displayNamesWithTooltips, renderAdditionalText = _a.renderAdditionalText;
    var translate = (0, useLocalize_1.default)().translate;
    var title = StringUtils_1.default.lineBreaksToSpaces(Parser_1.default.htmlToText(fullTitle)) || translate('common.hidden');
    if (!tooltipEnabled) {
        return (<DisplayNamesWithoutTooltip_1.default textStyles={textStyles} numberOfLines={numberOfLines} fullTitle={title} renderAdditionalText={renderAdditionalText}/>);
    }
    if (shouldUseFullTitle) {
        return (<DisplayNamesWithTooltip_1.default shouldUseFullTitle fullTitle={title} textStyles={textStyles} numberOfLines={numberOfLines} renderAdditionalText={renderAdditionalText}/>);
    }
    return (<DisplayNamesWithTooltip_1.default fullTitle={title} displayNamesWithTooltips={displayNamesWithTooltips} textStyles={textStyles} shouldAddEllipsis={shouldAddEllipsis} numberOfLines={numberOfLines} renderAdditionalText={renderAdditionalText}/>);
}
DisplayNames.displayName = 'DisplayNames';
exports.default = DisplayNames;
