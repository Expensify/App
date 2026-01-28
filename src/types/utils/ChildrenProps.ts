import type {ReactNode} from 'react';

type ChildrenProps = {
    /** Rendered child component */
    children: ReactNode;
    isOnSearch?: boolean;
};

export default ChildrenProps;
