import React from 'react';

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
const mapChildrenFlat = <T, C>(...args: Parameters<typeof React.Children.map<T, C>>) => {
    const mappedChildren = React.Children.map(...args);

    if (Array.isArray(mappedChildren) && mappedChildren.length === 1) {
        return mappedChildren[0];
    }

    return mappedChildren;
};

export default mapChildrenFlat;
