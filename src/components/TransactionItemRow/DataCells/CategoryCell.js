"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var TextWithIconCell_1 = require("@components/SelectionList/Search/TextWithIconCell");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CategoryUtils_1 = require("@libs/CategoryUtils");
function CategoryCell(_a) {
    var _b;
    var shouldUseNarrowLayout = _a.shouldUseNarrowLayout, shouldShowTooltip = _a.shouldShowTooltip, transactionItem = _a.transactionItem;
    var styles = (0, useThemeStyles_1.default)();
    var categoryForDisplay = (0, CategoryUtils_1.isCategoryMissing)(transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.category) ? '' : ((_b = transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.category) !== null && _b !== void 0 ? _b : '');
    return shouldUseNarrowLayout ? (<TextWithIconCell_1.default icon={Expensicons.Folder} showTooltip={shouldShowTooltip} text={categoryForDisplay} textStyle={[styles.textMicro, styles.mnh0]}/>) : (<TextWithTooltip_1.default shouldShowTooltip={shouldShowTooltip} text={categoryForDisplay} style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}/>);
}
CategoryCell.displayName = 'CategoryCell';
exports.default = CategoryCell;
