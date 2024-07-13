import type {FocusTargetOrFalse} from 'focus-trap-react';

type FocusTrapForModalProps = {
    children: React.ReactNode;
    active: boolean;
    initialFocus?: FocusTargetOrFalse | undefined | (() => void);
};

export default FocusTrapForModalProps;
