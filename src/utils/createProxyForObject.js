"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a proxy around an object variable that can be exported from modules, to allow modification from outside the module.
 * @param value the object that should be wrapped in a proxy
 * @returns A proxy object that can be modified from outside the module
 */
var createProxyForObject = function (value) {
    return new Proxy(value, {
        get: function (target, property) {
            if (typeof property === 'symbol') {
                return undefined;
            }
            return target[property];
        },
        set: function (target, property, newValue) {
            if (typeof property === 'symbol') {
                return false;
            }
            // eslint-disable-next-line no-param-reassign
            target[property] = newValue;
            return true;
        },
    });
};
exports.default = createProxyForObject;
