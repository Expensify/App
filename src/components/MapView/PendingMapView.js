"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function PendingMapView(_a) {
    var _b = _a.title, title = _b === void 0 ? '' : _b, _c = _a.subtitle, subtitle = _c === void 0 ? '' : _c, style = _a.style, _d = _a.isSmallerIcon, isSmallerIcon = _d === void 0 ? false : _d;
    var hasTextContent = !(0, isEmpty_1.default)(title) || !(0, isEmpty_1.default)(subtitle);
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var iconSize = isSmallerIcon ? variables_1.default.iconSizeSuperLarge : variables_1.default.iconSizeUltraLarge;
    return (<react_native_1.View style={[styles.mapPendingView, style]}>
            {hasTextContent ? (<BlockingView_1.default icon={Expensicons.EmptyStateRoutePending} iconColor={theme.border} title={title} subtitle={subtitle} subtitleStyle={styles.textSupporting} shouldShowLink={false}/>) : (<react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10]}>
                    <Icon_1.default src={Expensicons.EmptyStateRoutePending} width={iconSize} height={iconSize} fill={theme.border}/>
                </react_native_1.View>)}
        </react_native_1.View>);
}
PendingMapView.displayName = 'PendingMapView';
exports.default = PendingMapView;
