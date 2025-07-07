"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function UpgradeConfirmation(_a) {
    var policyName = _a.policyName, onConfirmUpgrade = _a.onConfirmUpgrade, isCategorizing = _a.isCategorizing, isTravelUpgrade = _a.isTravelUpgrade;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var description = (0, react_1.useMemo)(function () {
        if (isCategorizing) {
            return translate('workspace.upgrade.completed.categorizeMessage');
        }
        if (isTravelUpgrade) {
            return translate('workspace.upgrade.completed.travelMessage');
        }
        return (<>
                {translate('workspace.upgrade.completed.successMessage', { policyName: policyName })}{' '}
                <TextLink_1.default style={styles.link} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION.getRoute(Navigation_1.default.getActiveRoute())); }}>
                    {translate('workspace.upgrade.completed.viewSubscription')}
                </TextLink_1.default>{' '}
                {translate('workspace.upgrade.completed.moreDetails')}
            </>);
    }, [isCategorizing, isTravelUpgrade, policyName, styles.link, translate]);
    return (<ConfirmationPage_1.default heading={translate('workspace.upgrade.completed.headline')} description={description} shouldShowButton onButtonPress={onConfirmUpgrade} buttonText={translate('workspace.upgrade.completed.gotIt')} containerStyle={styles.h100}/>);
}
exports.default = UpgradeConfirmation;
