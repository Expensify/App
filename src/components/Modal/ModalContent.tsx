import type {ReactNode} from 'react';
import React from 'react';

type ModalContentProps = {
    /** Modal contents */
    children: ReactNode;

    /** called after modal content is dismissed */
    onDismiss: () => void;
};

function ModalContent({children, onDismiss = () => {}}: ModalContentProps) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => () => onDismiss?.(), []);
    return children;
}
ModalContent.displayName = 'ModalContent';

export default ModalContent;
