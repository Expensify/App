type UseScreenInitialFocusOptions = {
    /** Opts the screen out of post-transition initial focus. */
    skip?: boolean;
    /** Claim only when a screen reader is known-on; for screens with a competing async auto-focus target that would otherwise flash a ring for keyboard users. */
    claimOnlyForScreenReader?: boolean;
};

type UseScreenInitialFocus = (node: HTMLElement | null, options?: UseScreenInitialFocusOptions) => void;

export default UseScreenInitialFocus;
export type {UseScreenInitialFocusOptions};
