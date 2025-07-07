"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var Illustrations_1 = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PolicyUtils_1 = require("@libs/PolicyUtils");
function DowngradeConfirmation(_a) {
    var onConfirmDowngrade = _a.onConfirmDowngrade, policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var hasOtherControlWorkspaces = (0, PolicyUtils_1.hasOtherControlWorkspaces)(policyID);
    return (<ConfirmationPage_1.default heading={translate('workspace.downgrade.completed.headline')} description={hasOtherControlWorkspaces ? translate('workspace.downgrade.completed.description') : undefined} illustration={Illustrations_1.MushroomTopHat} shouldShowButton onButtonPress={onConfirmDowngrade} buttonText={translate('workspace.downgrade.completed.gotIt')} containerStyle={styles.h100}/>);
}
exports.default = DowngradeConfirmation;
