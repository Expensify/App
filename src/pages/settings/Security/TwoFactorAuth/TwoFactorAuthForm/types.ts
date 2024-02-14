import type {RefObject} from 'react';

type TwoFactorAuthFormProps = {
    innerRef: RefObject<HTMLFormElement> | (() => void);
};

type TwoFactorAuthFormNativeProps = {
    innerRef: () => void;
};

export type {TwoFactorAuthFormProps, TwoFactorAuthFormNativeProps};