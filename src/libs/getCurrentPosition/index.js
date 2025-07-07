"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getCurrentPosition_types_1 = require("./getCurrentPosition.types");
var getCurrentPosition = function (success, error, options) {
    if (navigator === undefined || !('geolocation' in navigator)) {
        error({
            code: getCurrentPosition_types_1.GeolocationErrorCode.NOT_SUPPORTED,
            message: 'Geolocation is not supported by this environment.',
            PERMISSION_DENIED: getCurrentPosition_types_1.GeolocationErrorCode.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: getCurrentPosition_types_1.GeolocationErrorCode.POSITION_UNAVAILABLE,
            TIMEOUT: getCurrentPosition_types_1.GeolocationErrorCode.TIMEOUT,
            NOT_SUPPORTED: getCurrentPosition_types_1.GeolocationErrorCode.NOT_SUPPORTED,
        });
        return;
    }
    navigator.geolocation.getCurrentPosition(success, error, options);
};
exports.default = getCurrentPosition;
