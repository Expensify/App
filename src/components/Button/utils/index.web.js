"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getButtonRole = void 0;
var CONST_1 = require("@src/CONST");
var getButtonRole = function (isNested) { return (isNested ? CONST_1.default.ROLE.PRESENTATION : CONST_1.default.ROLE.BUTTON); };
exports.getButtonRole = getButtonRole;
