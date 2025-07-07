"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
// Only has custom web implementation
types_1.default.getBackgroundColor = function () { return null; };
// Overwrite setTranslucent and setBackgroundColor suppress warnings on iOS
types_1.default.setTranslucent = function () { };
types_1.default.setBackgroundColor = function () { };
exports.default = types_1.default;
