import type {ReactNode} from 'react';

/**
 * The props every non-top screen wrapper receives, so wrapDescriptorsWithNonTopScreensBehavior can render any of
 * them interchangeably.
 */
type NonTopScreenWrapperProps = {
    /**
     * Whether another screen of the same navigator is on top of this one. This is a different notion of "blurred"
     * than FreezeWrapper/getIsScreenBlurred, where it means the route left the last two full-screen routes.
     */
    isScreenBlurred: boolean;

    /** The screen content to deprioritize while it is covered */
    children: ReactNode;
};

export default NonTopScreenWrapperProps;
