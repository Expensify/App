
exports.__esModule = true;
/* eslint-disable @typescript-eslint/naming-convention */
const native_1 = require('@react-navigation/native');

function replacePathInNestedState(state, path) {
    const found = native_1.findFocusedRoute(state);
    if (!found) {
        return;
    }
    // @ts-expect-error Updating read only property
    found.path = path;
}
exports['default'] = replacePathInNestedState;
