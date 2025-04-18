"use strict";
exports.__esModule = true;
var CONST_1 = require("@src/CONST");
var Log_1 = require("./Log");
var NumberUtils_1 = require("./NumberUtils");
var RequestThrottle = /** @class */ (function () {
    function RequestThrottle(name) {
        this.requestWaitTime = 0;
        this.requestRetryCount = 0;
        this.name = name;
    }
    RequestThrottle.prototype.clear = function () {
        this.requestWaitTime = 0;
        this.requestRetryCount = 0;
        if (this.timeoutID) {
            Log_1["default"].info("[RequestThrottle - " + this.name + "] clearing timeoutID: " + String(this.timeoutID));
            clearTimeout(this.timeoutID);
            this.timeoutID = undefined;
        }
        Log_1["default"].info("[RequestThrottle - " + this.name + "] cleared");
    };
    RequestThrottle.prototype.getRequestWaitTime = function () {
        if (this.requestWaitTime) {
            this.requestWaitTime = Math.min(this.requestWaitTime * 2, CONST_1["default"].NETWORK.MAX_RETRY_WAIT_TIME_MS);
        }
        else {
            this.requestWaitTime = NumberUtils_1.generateRandomInt(CONST_1["default"].NETWORK.MIN_RETRY_WAIT_TIME_MS, CONST_1["default"].NETWORK.MAX_RANDOM_RETRY_WAIT_TIME_MS);
        }
        return this.requestWaitTime;
    };
    RequestThrottle.prototype.getLastRequestWaitTime = function () {
        return this.requestWaitTime;
    };
    RequestThrottle.prototype.sleep = function (error, command) {
        var _this = this;
        this.requestRetryCount++;
        return new Promise(function (resolve, reject) {
            if (_this.requestRetryCount <= CONST_1["default"].NETWORK.MAX_REQUEST_RETRIES) {
                var currentRequestWaitTime = _this.getRequestWaitTime();
                Log_1["default"].info("[RequestThrottle - " + _this.name + "] Retrying request after error: '" + error.name + "', '" + error.message + "', '" + error.status + "'. Command: " + command + ". Retry count:  " + _this.requestRetryCount + ". Wait time: " + currentRequestWaitTime);
                _this.timeoutID = setTimeout(resolve, currentRequestWaitTime);
            }
            else {
                reject();
            }
        });
    };
    return RequestThrottle;
}());
exports["default"] = RequestThrottle;
