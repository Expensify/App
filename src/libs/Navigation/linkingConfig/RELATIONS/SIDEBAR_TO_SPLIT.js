"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
// This file is used to define the relationship between the sidebar (LHN) and the parent split navigator.
var SIDEBAR_TO_SPLIT = (_a = {},
    _a[SCREENS_1.default.SETTINGS.ROOT] = NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
    _a[SCREENS_1.default.HOME] = NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR,
    _a[SCREENS_1.default.WORKSPACE.INITIAL] = NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR,
    _a);
exports.default = SIDEBAR_TO_SPLIT;
