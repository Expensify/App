import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';

import React, {useRef} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type HoldSubmitterEducationalModalWrapperProps = ModalProps & {
    /** Whether the expense is from a DM (direct message) report */
    isDM?: boolean;
};

function HoldSubmitterEducationalModalWrapper({closeModal, isDM}: HoldSubmitterEducationalModalWrapperProps) {
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
        <HoldSubmitterEducationalModal
            isDM={isDM}
            onClose={() => close(ModalActions.CLOSE)}
            onConfirm={() => close(ModalActions.CONFIRM)}
        />
    );
}

export default HoldSubmitterEducationalModalWrapper;
