import type {FocusTrapProps} from 'focus-trap-react';

type FocusTrapOptions = Exclude<FocusTrapProps['focusTrapOptions'], undefined>;

type FocusTrapForModalProps = {
    children: React.ReactNode;
    active: boolean;
    initialFocus?: FocusTrapOptions['initialFocus'];
};

export default FocusTrapForModalProps;
