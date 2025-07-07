"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = usePermissions;
var react_1 = require("react");
var OnyxProvider_1 = require("@components/OnyxProvider");
var Permissions_1 = require("@libs/Permissions");
var permissionKey;
function usePermissions() {
    var betas = (0, react_1.useContext)(OnyxProvider_1.BetasContext);
    return (0, react_1.useMemo)(function () {
        var permissions = {
            isBetaEnabled: function (beta) { return Permissions_1.default.isBetaEnabled(beta, betas); },
        };
        for (permissionKey in Permissions_1.default) {
            if (betas && permissionKey !== 'isBetaEnabled') {
                var checkerFunction = Permissions_1.default[permissionKey];
                permissions[permissionKey] = checkerFunction(betas);
            }
        }
        return permissions;
    }, [betas]);
}
