"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var Text_1 = require("./Text");
function AttachmentOfflineIndicator(_a) {
    var _b = _a.isPreview, isPreview = _b === void 0 ? false : _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    // We don't want to show the offline indicator when the attachment is a cached one, so
    // we delay the display by 200 ms to ensure it is not a cached one.
    var _c = (0, react_1.useState)(true), onCacheDelay = _c[0], setOnCacheDelay = _c[1];
    (0, react_1.useEffect)(function () {
        var timeout = setTimeout(function () { return setOnCacheDelay(false); }, 200);
        return function () { return clearTimeout(timeout); };
    }, []);
    if (!isOffline || onCacheDelay) {
        return null;
    }
    return (<react_native_1.View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, styles.pAbsolute, styles.h100, styles.w100, isPreview && styles.hoveredComponentBG]}>
            <Icon_1.default fill={theme.icon} src={Expensicons.OfflineCloud} width={variables_1.default.iconSizeSuperLarge} height={variables_1.default.iconSizeSuperLarge}/>
            {!isPreview && (<react_native_1.View>
                    <Text_1.default style={[styles.notFoundTextHeader, styles.ph10]}>{translate('common.youAppearToBeOffline')}</Text_1.default>
                    <Text_1.default style={[styles.textAlignCenter, styles.ph11, styles.textSupporting]}>{translate('common.attachmentWillBeAvailableOnceBackOnline')}</Text_1.default>
                </react_native_1.View>)}
        </react_native_1.View>);
}
AttachmentOfflineIndicator.displayName = 'AttachmentOfflineIndicator';
exports.default = AttachmentOfflineIndicator;
