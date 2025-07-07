"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Balance_1 = require("./Balance");
function CurrentWalletBalance(_a) {
    var _b;
    var balanceStyles = _a.balanceStyles;
    var styles = (0, useThemeStyles_1.default)();
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET)[0];
    return (<Balance_1.default textStyles={[styles.pv5, styles.alignSelfCenter, balanceStyles]} balance={(_b = userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentBalance) !== null && _b !== void 0 ? _b : 0}/>);
}
CurrentWalletBalance.displayName = 'CurrentWalletBalance';
exports.default = CurrentWalletBalance;
