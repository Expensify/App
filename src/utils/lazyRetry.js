"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
/**
 * Attempts to lazily import a React component with a retry mechanism on failure.
 * If the initial import fails the function will refresh the page once and retry the import.
 * If the import fails again after the refresh, the error is propagated.
 *
 * @param componentImport - A function that returns a promise resolving to a lazily imported React component.
 * @returns A promise that resolves to the imported component or rejects with an error after a retry attempt.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var lazyRetry = function (componentImport) {
    return new Promise(function (resolve, reject) {
        var _a;
        // Retrieve the retry status from sessionStorage, defaulting to 'false' if not set
        var hasRefreshed = JSON.parse((_a = sessionStorage.getItem(CONST_1.default.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED)) !== null && _a !== void 0 ? _a : 'false');
        componentImport()
            .then(function (component) {
            // Reset the retry status to 'false' on successful import
            sessionStorage.setItem(CONST_1.default.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED, 'false'); // success so reset the refresh
            resolve(component);
        })
            .catch(function (component) {
            if (!hasRefreshed) {
                console.error('Failed to lazily import a React component, refreshing the page in order to retry the operation.', component);
                // Set the retry status to 'true' and refresh the page
                sessionStorage.setItem(CONST_1.default.SESSION_STORAGE_KEYS.RETRY_LAZY_REFRESHED, 'true');
                window.location.reload(); // Refresh the page to retry the import
            }
            else {
                console.error('Failed to lazily import a React component after the retry operation!', component);
                // If the import fails again reject with the error to trigger default error handling
                reject(component);
            }
        });
    });
};
exports.default = lazyRetry;
