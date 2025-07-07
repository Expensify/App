"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createPersonalDetails;
var falso_1 = require("@ngneat/falso");
function createPersonalDetails(index) {
    return {
        accountID: index,
        avatar: (0, falso_1.randAvatar)(),
        displayName: (0, falso_1.randWord)(),
        lastName: (0, falso_1.randWord)(),
        login: (0, falso_1.randEmail)(),
    };
}
