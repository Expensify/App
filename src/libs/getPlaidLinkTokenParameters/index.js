"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONFIG_1 = require("@src/CONFIG");
var ROUTES_1 = require("@src/ROUTES");
var getPlaidLinkTokenParameters = function () {
    var bankAccountRoute = window.location.href.includes('personal') ? ROUTES_1.default.BANK_ACCOUNT_PERSONAL : ROUTES_1.default.BANK_ACCOUNT;
    return { redirectURI: "".concat(CONFIG_1.default.EXPENSIFY.NEW_EXPENSIFY_URL).concat(bankAccountRoute) };
};
exports.default = getPlaidLinkTokenParameters;
