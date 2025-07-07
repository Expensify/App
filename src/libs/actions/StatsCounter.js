"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var Environment = require("@libs/Environment/Environment");
var getPlatform_1 = require("@libs/getPlatform");
var package_json_1 = require("../../../package.json");
var StatsCounter = function (eventName, value) {
    if (value === void 0) { value = 1; }
    Environment.getEnvironment().then(function (envName) {
        var platform = (0, getPlatform_1.default)();
        var version = package_json_1.default.version.replace(/\./g, '-');
        // This normalizes the name of the web platform so it will be more consistent in Grafana
        var grafanaEventName = "".concat(platform === 'web' ? 'webApp' : platform, ".").concat(envName, ".new.expensify.").concat(eventName, ".").concat(version);
        console.debug("Counter:".concat(grafanaEventName), value);
        if (Environment.isDevelopment()) {
            // Don't record stats on dev as this will mess up the accuracy of data in release builds of the app
            return;
        }
        var parameters = {
            type: 'counter',
            statName: grafanaEventName,
            value: value,
        };
        API.read(types_1.READ_COMMANDS.GRAPHITE, parameters, {});
    });
};
exports.default = StatsCounter;
