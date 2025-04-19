'use strict';
exports.__esModule = true;
/* eslint-disable @typescript-eslint/naming-convention */
var native_1 = require('@react-navigation/native');
function replacePathInNestedState(state, path) {
    var found = native_1.findFocusedRoute(state);
    if (!found) {
        return;
    }
    // @ts-expect-error Updating read only property
    found.path = path;
}
exports['default'] = replacePathInNestedState;
