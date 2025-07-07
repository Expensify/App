"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONFIG_1 = require("@src/CONFIG");
var isE2ETestSession = function () { return CONFIG_1.default.E2E_TESTING; };
exports.default = isE2ETestSession;
