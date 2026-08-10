import type {ReactNode} from 'react';

/**
 * The props every non-top screen wrapper receives. One shape for all of them, so
 * wrapDescriptorsWithNonTopScreensBehavior can pick a wrapper by behavior and render it without knowing which one
 * it got.
 */
type NonTopScreenWrapperProps = {
    /** Whether another screen of the same navigator is on top of this one. Such a screen can still be visible, for
     * example dimmed under the RHP overlay on wide layouts. */
    isScreenBlurred: boolean;

    /** Key identifying this screen instance */
    routeKey: string;

    /** Name of the screen the wrapper is applied to */
    routeName: string;

    /** The screen content to deprioritize while it is covered */
    children: ReactNode;
};

export default NonTopScreenWrapperProps;
