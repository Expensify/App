"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
/**
 * Maps over the children of a React component and extracts the result of the mapping if there is only one child.
 *
 * @param children The children to map over.
 * @param fn The callback to run for each child.
 * @returns The flattened result of mapping over the children.
 *
 * @example
 * // Usage example:
 * const result = mapChildrenFlat(children, (child, index) => {
 *   // Your mapping logic here
 *   return modifiedChild;
 * });
 */
var mapChildrenFlat = function (element, fn) {
    if (typeof element === 'function') {
        return element(false);
    }
    var mappedChildren = react_1.default.Children.map(element, fn);
    if (Array.isArray(mappedChildren) && mappedChildren.length === 1) {
        return mappedChildren.at(0);
    }
    return mappedChildren;
};
exports.default = mapChildrenFlat;
