"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function RequestEarlyCancellationMenuItem() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _a.isActingAsDelegate, showDelegateNoAccessModal = _a.showDelegateNoAccessModal;
    var handleRequestEarlyCancellationPress = function () {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION);
    };
    return (<MenuItem_1.default title={translate('subscription.requestEarlyCancellation.title')} icon={Expensicons.CalendarSolid} shouldShowRightIcon wrapperStyle={styles.sectionMenuItemTopDescription} onPress={handleRequestEarlyCancellationPress}/>);
}
RequestEarlyCancellationMenuItem.displayName = 'RequestEarlyCancellationMenuItem';
exports.default = RequestEarlyCancellationMenuItem;
