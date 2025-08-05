import type {ReactNode} from 'react';

type ChildrenProps = {
    /** Rendered child component */
    children: ReactNode;

    /** Reference to the outer element */
    ref?: unknown
};

export default ChildrenProps;
