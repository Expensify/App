"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var memfs_1 = require("memfs");
var promisesMock = memfs_1.fs.promises;
exports.default = promisesMock;
