"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parseCommandLineArguments;
// Function to parse command-line arguments into a key-value object
function parseCommandLineArguments() {
    var args = process.argv.slice(2); // Skip node and script paths
    var argsMap = {};
    args.forEach(function (arg) {
        var _a = arg.split('='), key = _a[0], value = _a[1];
        if (key.startsWith('--')) {
            var name_1 = key.substring(2);
            argsMap[name_1] = value;
            // User may provide a help arg without any value
            if (name_1.toLowerCase() === 'help' && !value) {
                argsMap[name_1] = 'true';
            }
        }
    });
    return argsMap;
}
