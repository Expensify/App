import type {FocusTrapProps} from 'focus-trap-react';

type FocusTrapForScreenProps = {
    children: React.ReactNode;

    /** Overrides the focus trap settings */
    focusTrapSettings?: Pick<FocusTrapProps, 'containerElements' | 'focusTrapOptions' | 'active'>;
};

export default FocusTrapForScreenProps;
