"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var falso_1 = require("@ngneat/falso");
function getValidCodeCredentials(login) {
    if (login === void 0) { login = (0, falso_1.randEmail)(); }
    return {
        login: login,
        validateCode: "".concat((0, falso_1.randNumber)()),
    };
}
exports.default = getValidCodeCredentials;
