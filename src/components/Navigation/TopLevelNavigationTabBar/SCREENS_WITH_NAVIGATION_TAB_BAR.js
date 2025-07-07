"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var RELATIONS_1 = require("@libs/Navigation/linkingConfig/RELATIONS");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var SCREENS_WITH_NAVIGATION_TAB_BAR = __spreadArray(__spreadArray([], Object.keys(RELATIONS_1.SIDEBAR_TO_SPLIT), true), [NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS_1.default.SEARCH.ROOT, SCREENS_1.default.WORKSPACES_LIST], false);
exports.default = SCREENS_WITH_NAVIGATION_TAB_BAR;
