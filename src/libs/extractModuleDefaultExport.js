"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
/**
 * Extract the default export from something that's been dynamically imported with ESM import().
 * It should not be necessary, except that our Jest config mangles imports.
 */
function default_1(module) {
    var topLevelDefault = module.default;
    if (topLevelDefault && typeof topLevelDefault === 'object' && 'default' in topLevelDefault) {
        return topLevelDefault.default;
    }
    return topLevelDefault;
}
