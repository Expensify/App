"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RequireTwoFactorAuthenticationModal_1 = require("@components/RequireTwoFactorAuthenticationModal");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Xero_1 = require("@libs/actions/connections/Xero");
var Modal_1 = require("@libs/actions/Modal");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Link_1 = require("@userActions/Link");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ConnectToXeroFlow(_a) {
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var is2FAEnabled = account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth;
    var _b = (0, react_1.useState)(false), isRequire2FAModalOpen = _b[0], setIsRequire2FAModalOpen = _b[1];
    (0, react_1.useEffect)(function () {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        (0, Link_1.openLink)((0, Xero_1.getXeroSetupLink)(policyID), environmentURL);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    if (!is2FAEnabled) {
        return (<RequireTwoFactorAuthenticationModal_1.default onSubmit={function () {
                setIsRequire2FAModalOpen(false);
                (0, Modal_1.close)(function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_ROOT.getRoute(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID), (0, Xero_1.getXeroSetupLink)(policyID))); });
            }} onCancel={function () {
                setIsRequire2FAModalOpen(false);
            }} isVisible={isRequire2FAModalOpen} description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}/>);
    }
}
exports.default = ConnectToXeroFlow;
