"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeviceCapabilities = require("@libs/DeviceCapabilities");
var canFocusInputOnScreenFocus = function () { return !DeviceCapabilities.canUseTouchScreen(); };
exports.default = canFocusInputOnScreenFocus;
