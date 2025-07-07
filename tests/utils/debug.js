"use strict";
/**
 * The debug utility that ships with react native testing library does not work properly and
 * has limited functionality. This is a better version of it that allows logging a subtree of
 * the app.
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = debug;
var pretty_format_1 = require("pretty-format");
var react_is_1 = require("react-is");
// These are giant objects and cause the serializer to crash because the
// output becomes too large.
var NativeComponentPlugin = {
    // eslint-disable-next-line no-underscore-dangle
    test: function (val) { return !!(val === null || val === void 0 ? void 0 : val._reactInternalInstance); },
    serialize: function () { return 'NativeComponentInstance {}'; },
};
var format = function (input, options) {
    return (0, pretty_format_1.default)(input, {
        plugins: [pretty_format_1.plugins.ReactTestComponent, pretty_format_1.plugins.ReactElement, NativeComponentPlugin],
        highlight: true,
        printBasicPrototype: false,
        maxDepth: options.maxDepth,
    });
};
function getType(element) {
    var type = element.type;
    if (typeof type === 'string') {
        return type;
    }
    if (typeof type === 'function') {
        return type.displayName || type.name || 'Unknown';
    }
    if (react_is_1.default.isFragment(element)) {
        return 'React.Fragment';
    }
    if (react_is_1.default.isSuspense(element)) {
        return 'React.Suspense';
    }
    if (typeof type === 'object' && type !== null) {
        if (react_is_1.default.isContextProvider(element)) {
            return 'Context.Provider';
        }
        if (react_is_1.default.isContextConsumer(element)) {
            return 'Context.Consumer';
        }
        if (react_is_1.default.isForwardRef(element)) {
            if (type.displayName) {
                return type.displayName;
            }
            var functionName = type.render.displayName || type.render.name || '';
            return functionName === '' ? 'ForwardRef' : "ForwardRef(".concat(functionName, ")");
        }
        if (react_is_1.default.isMemo(element)) {
            var functionName = type.displayName || type.type.displayName || type.type.name || '';
            return functionName === '' ? 'Memo' : "Memo(".concat(functionName, ")");
        }
    }
    return 'UNDEFINED';
}
function getProps(props, options) {
    if (!options.includeProps) {
        return {};
    }
    var children = props.children, propsWithoutChildren = __rest(props, ["children"]);
    return propsWithoutChildren;
}
function toJSON(node, options) {
    var _a, _b;
    var json = {
        $$typeof: Symbol.for('react.test.json'),
        type: getType({ type: node.type, $$typeof: Symbol.for('react.element') }),
        props: getProps(node.props, options),
        children: (_b = (_a = node.children) === null || _a === void 0 ? void 0 : _a.map(function (c) { return (typeof c === 'string' ? c : toJSON(c, options)); })) !== null && _b !== void 0 ? _b : null,
    };
    return json;
}
function formatNode(node, options) {
    return format(toJSON(node, options), options);
}
/**
 * Log a subtree of the app for debugging purposes.
 *
 * @example debug(screen.getByTestId('report-actions-view-wrapper'));
 */
function debug(node, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.includeProps, includeProps = _c === void 0 ? true : _c, _d = _b.maxDepth, maxDepth = _d === void 0 ? Infinity : _d;
    var options = { includeProps: includeProps, maxDepth: maxDepth };
    if (node == null) {
        console.log('null');
    }
    else if (Array.isArray(node)) {
        console.log(node.map(function (n) { return formatNode(n, options); }).join('\n'));
    }
    else {
        console.log(formatNode(node, options));
    }
}
