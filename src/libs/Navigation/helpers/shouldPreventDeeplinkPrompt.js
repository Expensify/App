"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldPreventDeeplinkPrompt;
var CONST_1 = require("@src/CONST");
/**
 * Determines if the deeplink prompt should be shown on the current screen
 */
function shouldPreventDeeplinkPrompt(screenName) {
    // We don't want to show the deeplink prompt on screens where a user is in the
    // authentication process, so we are blocking the prompt on the following screens (Denylist)
    return CONST_1.default.DEEPLINK_PROMPT_DENYLIST.some(function (name) { return name === screenName; });
}
