"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function MerchantOrDescriptionCell(_a) {
    var merchantOrDescription = _a.merchantOrDescription, shouldShowTooltip = _a.shouldShowTooltip, shouldUseNarrowLayout = _a.shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    return (<TextWithTooltip_1.default shouldShowTooltip={shouldShowTooltip} text={merchantOrDescription} style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1]}/>);
}
MerchantOrDescriptionCell.displayName = 'MerchantOrDescriptionCell';
exports.default = MerchantOrDescriptionCell;
