"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var TextWithIconCell_1 = require("@components/SelectionList/Search/TextWithIconCell");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TransactionUtils_1 = require("@libs/TransactionUtils");
function TagCell(_a) {
    var shouldUseNarrowLayout = _a.shouldUseNarrowLayout, shouldShowTooltip = _a.shouldShowTooltip, transactionItem = _a.transactionItem;
    var styles = (0, useThemeStyles_1.default)();
    return shouldUseNarrowLayout ? (<TextWithIconCell_1.default icon={Expensicons.Tag} showTooltip={shouldShowTooltip} text={(0, TransactionUtils_1.getTagForDisplay)(transactionItem)} textStyle={[styles.textMicro, styles.mnh0]}/>) : (<TextWithTooltip_1.default shouldShowTooltip={shouldShowTooltip} text={(0, TransactionUtils_1.getTagForDisplay)(transactionItem)} style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}/>);
}
TagCell.displayName = 'TagCell';
exports.default = TagCell;
