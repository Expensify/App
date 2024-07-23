import type FocusTrap from 'focus-trap-react';

type FocusTrapForScreenProps = {
    children: React.ReactNode;
    focusTrapSettings?: Pick<FocusTrap.Props, 'containerElements' | 'focusTrapOptions'>;
};

export default FocusTrapForScreenProps;
