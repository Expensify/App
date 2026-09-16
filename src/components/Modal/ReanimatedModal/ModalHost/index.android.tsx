// Android initially measures modal content against the activity window, before the dialog has its own bounds.
import type {ModalProps} from 'react-native';

import React, {useState} from 'react';
import {Modal} from 'react-native';

function VisibleModalHost({children, onShow, ...props}: ModalProps) {
    const [isWindowReady, setIsWindowReady] = useState(false);

    const showContent: ModalProps['onShow'] = (event) => {
        setIsWindowReady(true);
        onShow?.(event);
    };

    return (
        <Modal
            {...props}
            onShow={showContent}
        >
            {isWindowReady ? children : null}
        </Modal>
    );
}

function ModalHost({visible = true, ...props}: ModalProps) {
    // Each dialog opening needs a fresh onShow event before its entering animations can start.
    return visible ? (
        <VisibleModalHost
            {...props}
            visible
        />
    ) : null;
}

export default ModalHost;
