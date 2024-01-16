import React from 'react';
import type ModalContentProps from './types';

function ModalContent({children, onDismiss = () => {}}: ModalContentProps) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => () => onDismiss?.(), []);
    return children;
}
ModalContent.displayName = 'ModalContent';

export default ModalContent;
