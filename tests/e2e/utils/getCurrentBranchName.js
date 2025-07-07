"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var getCurrentBranchName = function () {
    var stdout = (0, child_process_1.execSync)('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
    });
    return stdout.trim();
};
exports.default = getCurrentBranchName;
