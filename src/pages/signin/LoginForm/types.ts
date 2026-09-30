import type {ForwardedRef} from 'react';
import type {SubmitBehavior} from 'react-native';

type LoginFormProps = {
    scrollPageToTop?: () => void;

    /** Should we dismiss the keyboard when transitioning away from the page? */
    submitBehavior?: SubmitBehavior;

    isVisible: boolean;
    ref?: ForwardedRef<InputHandle>;
};

type InputHandle = {
    isInputFocused: () => boolean;
    clearDataAndFocus: (clearLogin?: boolean) => void;
};

export type {InputHandle};

export default LoginFormProps;
