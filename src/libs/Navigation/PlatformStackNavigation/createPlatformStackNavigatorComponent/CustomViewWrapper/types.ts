import type {ReactNode} from 'react';

type CustomViewWrapperProps = {
    /** Whether the painted content is covered, which takes it out of accessibility and touch handling */
    inert?: boolean;

    /** The content to keep painted while React hides the surrounding subtree */
    children: ReactNode;
};

export default CustomViewWrapperProps;
