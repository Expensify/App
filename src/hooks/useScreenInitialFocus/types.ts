type UseScreenInitialFocusOptions = {
    /** Opts the screen out of post-transition initial focus (e.g. when Enter must trigger a form submit, not the Back button). */
    skip?: boolean;
};

type UseScreenInitialFocus = (node: HTMLElement | null, options?: UseScreenInitialFocusOptions) => void;

export default UseScreenInitialFocus;
export type {UseScreenInitialFocusOptions};
