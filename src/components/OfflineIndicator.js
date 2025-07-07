"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var Text_1 = require("./Text");
function OfflineIndicator(_a) {
    var style = _a.style, containerStylesProp = _a.containerStyles, _b = _a.addBottomSafeAreaPadding, addBottomSafeAreaPadding = _b === void 0 ? false : _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var fallbackStyle = (0, react_1.useMemo)(function () { return [styles.offlineIndicatorContainer, containerStylesProp]; }, [styles.offlineIndicatorContainer, containerStylesProp]);
    var containerStyles = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({
        addBottomSafeAreaPadding: addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        style: fallbackStyle,
    });
    if (!isOffline) {
        return null;
    }
    return (<react_native_1.View style={[containerStyles, styles.flexRow, styles.alignItemsCenter, style]}>
            <Icon_1.default fill={theme.icon} src={Expensicons.OfflineCloud} width={variables_1.default.iconSizeSmall} height={variables_1.default.iconSizeSmall}/>
            <Text_1.default style={[styles.ml3, styles.chatItemComposeSecondaryRowSubText]}>{translate('common.youAppearToBeOffline')}</Text_1.default>
        </react_native_1.View>);
}
OfflineIndicator.displayName = 'OfflineIndicator';
exports.default = OfflineIndicator;
