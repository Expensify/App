"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldOpenOnAdminRoom;
var currentUrl_1 = require("@libs/Navigation/currentUrl");
function shouldOpenOnAdminRoom() {
    var url = (0, currentUrl_1.default)();
    return url ? new URL(url).searchParams.get('openOnAdminRoom') === 'true' : false;
}
