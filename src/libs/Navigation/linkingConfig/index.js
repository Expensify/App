"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkingConfig = void 0;
var getAdaptedStateFromPath_1 = require("@libs/Navigation/helpers/getAdaptedStateFromPath");
var config_1 = require("./config");
var prefixes_1 = require("./prefixes");
var linkingConfig = {
    getStateFromPath: getAdaptedStateFromPath_1.default,
    prefixes: prefixes_1.default,
    config: config_1.config,
};
exports.linkingConfig = linkingConfig;
