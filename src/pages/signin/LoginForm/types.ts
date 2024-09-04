type LoginFormProps = {
    /** The login input value */
    login: string;

    /** A callback to notify that the login input value is changed */
    onLoginChanged: (login: string) => void;

    /** Function used to scroll to the top of the page */
    scrollPageToTop?: () => void;

    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit?: boolean;

    /** Whether the content is visible. */
    isVisible: boolean;
};

type InputHandle = {
    isInputFocused: () => boolean;
    clearDataAndFocus: (clearLogin?: boolean) => void;
};

export type {InputHandle};

export default LoginFormProps;
