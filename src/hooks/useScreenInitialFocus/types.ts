type UseScreenInitialFocusOptions = {
    /** Opts the screen out of post-transition initial focus. */
    skip?: boolean;
};

type UseScreenInitialFocus = (node: HTMLElement | null, options?: UseScreenInitialFocusOptions) => void;

export default UseScreenInitialFocus;
export type {UseScreenInitialFocusOptions};
