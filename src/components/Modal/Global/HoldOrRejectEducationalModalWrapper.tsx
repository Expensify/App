import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';

import React, {useRef} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type HoldOrRejectEducationalModalWrapperProps = ModalProps;

function HoldOrRejectEducationalModalWrapper({closeModal}: HoldOrRejectEducationalModalWrapperProps) {
    // `closeModal` pops whatever sits on top of the stack, so it must only run once for this entry
    const hasClosedRef = useRef(false);

    const close = (action: typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE) => {
        if (hasClosedRef.current) {
            return;
        }
        hasClosedRef.current = true;
        closeModal({action});
    };

    return (
        <HoldOrRejectEducationalModal
            onClose={() => close(ModalActions.CLOSE)}
            onConfirm={() => close(ModalActions.CONFIRM)}
        />
    );
}

export default HoldOrRejectEducationalModalWrapper;
