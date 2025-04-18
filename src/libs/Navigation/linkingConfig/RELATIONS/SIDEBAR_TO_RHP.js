"use strict";
var _a;
exports.__esModule = true;
var SCREENS_1 = require("@src/SCREENS");
/**
 * This file is used to define the relationship between the sidebar and the right hand pane (RHP) screen.
 * This means that going back from RHP will take the user directly to the sidebar. On wide layout the default central screen will be used to fill the space.
 */
var SIDEBAR_TO_RHP = (_a = {},
    _a[SCREENS_1["default"].SETTINGS.ROOT] = [
        SCREENS_1["default"].SETTINGS.SHARE_CODE,
        SCREENS_1["default"].SETTINGS.PROFILE.STATUS,
        SCREENS_1["default"].SETTINGS.PREFERENCES.PRIORITY_MODE,
        SCREENS_1["default"].SETTINGS.EXIT_SURVEY.REASON,
        SCREENS_1["default"].SETTINGS.EXIT_SURVEY.RESPONSE,
        SCREENS_1["default"].SETTINGS.EXIT_SURVEY.CONFIRM,
    ],
    _a);
exports["default"] = SIDEBAR_TO_RHP;
