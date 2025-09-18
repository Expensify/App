import type {ForwardedRef} from 'react';

type LoginFormProps = {
    /** Function used to scroll to the top of the page */
    scrollPageToTop?: () => void;

    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit?: boolean;

    /** Whether the content is visible. */
    isVisible: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<InputHandle>;
};

type InputHandle = {
    isInputFocused: () => boolean;
    clearDataAndFocus: (clearLogin?: boolean) => void;
};

export type {InputHandle};

export default LoginFormProps;
