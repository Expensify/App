"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var uniqueID = expensify_common_1.Str.guid();
/**
 * Get the "unique ID of the device".
 * Note deviceID is not truly unique but will be a new GUID each time the app runs (we work around this limitation by saving it in Onyx)
 *
 * This GUID is stored in Onyx under ONYXKEYS.DEVICE_ID and is preserved on logout, such that the deviceID will only change if:
 *
 *   - The user opens the app on a different browser or in an incognito window, OR
 *   - The user manually clears Onyx data
 *
 * While this isn't perfect, it's just as good as any other obvious web solution, such as this one https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId
 * which is also different/reset under the same circumstances
 */
var generateDeviceID = function () { return Promise.resolve(uniqueID); };
exports.default = generateDeviceID;
