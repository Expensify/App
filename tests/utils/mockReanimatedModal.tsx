import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';

import React from 'react';

type MockReanimatedModalProps = Pick<ReanimatedModalProps, 'children' | 'onModalHide'> & Required<Pick<ReanimatedModalProps, 'isVisible'>>;

function MockReanimatedModal({isVisible, onModalHide, children}: MockReanimatedModalProps) {
    const wasVisible = React.useRef<boolean>(isVisible);

    React.useEffect(() => {
        if (wasVisible.current && !isVisible) {
            onModalHide?.();
        }
        wasVisible.current = isVisible;
    }, [isVisible, onModalHide]);

    if (!isVisible) {
        return null;
    }

    return children;
}

export default MockReanimatedModal;
