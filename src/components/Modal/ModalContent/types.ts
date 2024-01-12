import type {ReactNode} from 'react';

type ModalContentProps = {
    /** Modal contents */
    children: ReactNode;

    /** called after modal content is dismissed */
    onDismiss: () => void;
};

export default ModalContentProps;
