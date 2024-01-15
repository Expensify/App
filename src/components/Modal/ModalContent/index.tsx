import {useEffect, useRef} from 'react';
import type ModalContentProps from './types';

function ModalContent({children, onDismiss = () => {}}: ModalContentProps) {
    const dismissRef = useRef(onDismiss);
    dismissRef.current = onDismiss;
    useEffect(
        () => () => {
            if (typeof dismissRef.current !== 'function') {
                return;
            }
            dismissRef.current();
        },
        [],
    );
    return children;
}
ModalContent.displayName = 'ModalContent';

export default ModalContent;
