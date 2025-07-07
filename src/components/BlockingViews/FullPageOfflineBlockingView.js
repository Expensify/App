"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useTheme_1 = require("@hooks/useTheme");
var BlockingView_1 = require("./BlockingView");
function FullPageOfflineBlockingView(_a) {
    var children = _a.children, _b = _a.addBottomSafeAreaPadding, addBottomSafeAreaPadding = _b === void 0 ? true : _b, _c = _a.addOfflineIndicatorBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _c === void 0 ? addBottomSafeAreaPadding : _c;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var theme = (0, useTheme_1.default)();
    if (isOffline) {
        return (<BlockingView_1.default icon={Expensicons.OfflineCloud} iconColor={theme.offline} title={translate('common.youAppearToBeOffline')} subtitle={translate('common.thisFeatureRequiresInternet')} addBottomSafeAreaPadding={addBottomSafeAreaPadding} addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}/>);
    }
    return children;
}
FullPageOfflineBlockingView.displayName = 'FullPageOfflineBlockingView';
exports.default = FullPageOfflineBlockingView;
