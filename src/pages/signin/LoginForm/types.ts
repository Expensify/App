type LoginFormBaseProps = {
    /** Function used to scroll to the top of the page */
    scrollPageToTop: () => void;

    /** Whether the sign-in page is being rendered in the RHP modal */
    isInModal?: boolean;

    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit?: boolean;

    /** Whether the content is visible. */
    isVisible: boolean;
};

type InputHandle = {
    isInputFocused: () => boolean;
    clearDataAndFocus: (clearLogin: boolean) => void;
};

export type {InputHandle};

export default LoginFormBaseProps;
