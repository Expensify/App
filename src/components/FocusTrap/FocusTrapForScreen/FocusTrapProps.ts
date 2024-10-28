import type FocusTrap from 'focus-trap-react';

type FocusTrapForScreenProps = {
    children: React.ReactNode;

    /** Overrides the focus trap settings */
    focusTrapSettings?: Pick<FocusTrap.Props, 'containerElements' | 'focusTrapOptions' | 'active'>;
};

export default FocusTrapForScreenProps;
