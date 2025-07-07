"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var CONST_1 = require("@src/CONST");
function DateCell(_a) {
    var created = _a.created, showTooltip = _a.showTooltip, isLargeScreenWidth = _a.isLargeScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var date = DateUtils_1.default.formatWithUTCTimeZone(created, DateUtils_1.default.doesDateBelongToAPastYear(created) ? CONST_1.default.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST_1.default.DATE.MONTH_DAY_ABBR_FORMAT);
    return (<TextWithTooltip_1.default text={date} shouldShowTooltip={showTooltip} style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}/>);
}
DateCell.displayName = 'DateCell';
exports.default = DateCell;
