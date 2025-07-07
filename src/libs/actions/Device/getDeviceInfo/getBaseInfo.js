"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var package_json_1 = require("../../../../../package.json");
var getBaseInfo = function () { return ({
    appVersion: package_json_1.default.version,
    timestamp: new Date().toISOString().slice(0, 19),
}); };
exports.default = getBaseInfo;
