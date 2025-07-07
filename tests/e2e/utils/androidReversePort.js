"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var execAsync_1 = require("./execAsync");
function androidReversePort() {
    return (0, execAsync_1.default)("adb reverse tcp:".concat(config_1.default.SERVER_PORT, " tcp:").concat(config_1.default.SERVER_PORT));
}
exports.default = androidReversePort;
