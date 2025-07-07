"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reportAttributes_1 = require("./configs/reportAttributes");
/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
var ONYX_DERIVED_VALUES = (_a = {},
    _a[ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES] = reportAttributes_1.default,
    _a);
exports.default = ONYX_DERIVED_VALUES;
