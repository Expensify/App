"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var path_1 = require("path");
var reactNativeConfigMock = dotenv_1.default.config({ path: path_1.default.resolve('./.env.example') }).parsed;
exports.default = reactNativeConfigMock;
