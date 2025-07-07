"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONFIG_1 = require("@src/CONFIG");
var getPlaidLinkTokenParameters = function () { return ({
    redirectURI: "".concat(CONFIG_1.default.EXPENSIFY.NEW_EXPENSIFY_URL, "partners/plaid/oauth_ios"),
}); };
exports.default = getPlaidLinkTokenParameters;
