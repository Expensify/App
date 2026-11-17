import type {ReactNode} from 'react';

import React from 'react';

/**
 * Whether `children` would render anything. Unlike `!!children`, it treats sibling conditionals that all
 * came out empty (`[false, null, '']`) as no children.
 */
function hasRenderableChildren(children: ReactNode): boolean {
    // `toArray` drops `null`, `undefined` and booleans, but keeps empty strings
    return React.Children.toArray(children).some((child) => child !== '');
}

export default hasRenderableChildren;
