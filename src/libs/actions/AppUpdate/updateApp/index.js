"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateApp;
/**
 * On web or mWeb we can simply refresh the page and the user should have the new version of the app downloaded.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateApp(isProduction) {
    window.location.reload();
}
