import {Children, ReactNode} from 'react';

/**
 * A wrapper over `Children.map` which preserves the `ReactNode` structure.
 *
 * @param children - a `ReactNode` children structure (i.e. either a single React node or an iterable of React nodes)
 * @param fn - a mapping function
 *
 * @returns - a single mapped React node if `children` was a single node, or an iterable of mapped React nodes if
 *            `children` was an iterable of React nodes
 */
function mapChildren(children: ReactNode, fn: (child: ReactNode) => ReactNode): ReactNode {
    // Mirroring the `Children.map` handling of `null` and `undefined`
    if (children === null || children === undefined) {
        return children;
    }

    if (typeof children === 'object' && typeof children !== 'string' && Symbol.iterator in children) {
        // `Children.map` doesn't accept `Iterable` (at least on the type level), while `ReactNode` is defined as
        // "single node OR `Iterable<ReactNode>`".
        return Children.map(Array.isArray(children) ? children : [...children], fn);
    }

    const mappedChildren = Children.map(children, fn);

    // Per the `Children.map` contract, if it is provided with a single node `children` and a function mapping to a
    // single node, it will return an array with the single mapped node.
    return mappedChildren[0];
}

export default mapChildren;
