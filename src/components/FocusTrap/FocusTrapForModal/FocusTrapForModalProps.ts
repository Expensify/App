import type FocusTrap from 'focus-trap-react';

type FocusTrapOptions = Exclude<FocusTrap.Props['focusTrapOptions'], undefined>;

type FocusTrapForModalProps = {
    children: React.ReactNode;
    active: boolean;
    initialFocus?: FocusTrapOptions['initialFocus'];
};

export default FocusTrapForModalProps;
