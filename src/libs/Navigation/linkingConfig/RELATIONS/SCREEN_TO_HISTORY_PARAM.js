"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var HISTORY_PARAM_1 = require("@libs/Navigation/linkingConfig/HISTORY_PARAM");
var SCREENS_1 = require("@src/SCREENS");
// This file maps screens to their history parameters
var SCREEN_TO_HISTORY_PARAM = (_a = {},
    _a[SCREENS_1.default.SETTINGS.DELEGATE.DELEGATE_CONFIRM] = HISTORY_PARAM_1.default.SHOW_VALIDATE_CODE_ACTION_MODAL,
    _a);
exports.default = SCREEN_TO_HISTORY_PARAM;
