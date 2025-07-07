"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var joinPaths = function () {
    var _a;
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    return (_a = [])
        .concat.apply(_a, paths.map(function (p) { return p.split('/'); })).filter(Boolean)
        .join('/');
};
var createConfigItem = function (screen, routeNames, pattern, path, parse) {
    // Normalize pattern to remove any leading, trailing slashes, duplicate slashes etc.
    pattern = pattern.split('/').filter(Boolean).join('/');
    var regex = pattern
        ? new RegExp("^(".concat(pattern
            .split('/')
            .map(function (it) {
            if (it.startsWith(':')) {
                return "(([^/]+\\/)".concat(it.endsWith('?') ? '?' : '', ")");
            }
            return "".concat(it === '*' ? '.*' : escape(it), "\\/");
        })
            .join(''), ")"))
        : undefined;
    return {
        screen: screen,
        regex: regex,
        pattern: pattern,
        path: path,
        // The routeNames array is mutated, so copy it to keep the current state
        routeNames: __spreadArray([], routeNames, true),
        parse: parse,
    };
};
var createNormalizedConfigs = function (screen, routeConfig, routeNames, initials, parentScreens, parentPattern) {
    if (routeNames === void 0) { routeNames = []; }
    var configs = [];
    routeNames.push(screen);
    parentScreens.push(screen);
    // @ts-expect-error: we can't strongly typecheck this for now
    var config = routeConfig[screen];
    if (typeof config === 'string') {
        // If a string is specified as the value of the key(e.g. Foo: '/path'), use it as the pattern
        var pattern = parentPattern ? joinPaths(parentPattern, config) : config;
        configs.push(createConfigItem(screen, routeNames, pattern, config));
    }
    else if (typeof config === 'object') {
        var pattern_1;
        // if an object is specified as the value (e.g. Foo: { ... }),
        // it can have `path` property and
        // it could have `screens` prop which has nested configs
        if (typeof config.path === 'string') {
            if (config.exact && config.path === undefined) {
                throw new Error("A 'path' needs to be specified when specifying 'exact: true'. If you don't want this screen in the URL, specify it as empty string, e.g. `path: ''`.");
            }
            pattern_1 = config.exact !== true ? joinPaths(parentPattern || '', config.path || '') : config.path || '';
            configs.push(createConfigItem(screen, routeNames, pattern_1, config.path, config.parse));
        }
        if (config.screens) {
            // property `initialRouteName` without `screens` has no purpose
            if (config.initialRouteName) {
                initials.push({
                    initialRouteName: config.initialRouteName,
                    parentScreens: parentScreens,
                });
            }
            Object.keys(config.screens).forEach(function (nestedConfig) {
                var result = createNormalizedConfigs(nestedConfig, config.screens, routeNames, initials, __spreadArray([], parentScreens, true), pattern_1 !== null && pattern_1 !== void 0 ? pattern_1 : parentPattern);
                configs.push.apply(configs, result);
            });
        }
    }
    routeNames.pop();
    return configs;
};
exports.default = createNormalizedConfigs;
