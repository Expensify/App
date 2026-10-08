import React, {useCallback, useEffect, useRef, useState} from 'react';

import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';

type ShowModalCallback = (onConfirm: () => void) => void;

let showHoldModalGlobal: ShowModalCallback | null = null;
let showRejectModalGlobal: ShowModalCallback | null = null;

function showHoldEducationalModal(onConfirm: () => void) {
    showHoldModalGlobal?.(onConfirm);
}

function showRejectEducationalModal(onConfirm: () => void) {
    showRejectModalGlobal?.(onConfirm);
}

function HoldEducationalModalManager() {
    const [isHoldVisible, setIsHoldVisible] = useState(false);
    const [isRejectVisible, setIsRejectVisible] = useState(false);
    const onConfirmRef = useRef<() => void>(() => {});

    const dismissHold = useCallback(() => {
        const onConfirm = onConfirmRef.current;
        onConfirmRef.current = () => {};
        setIsHoldVisible(false);
        onConfirm();
    }, []);

    const dismissReject = useCallback(() => {
        const onConfirm = onConfirmRef.current;
        onConfirmRef.current = () => {};
        setIsRejectVisible(false);
        onConfirm();
    }, []);

    useEffect(() => {
        showHoldModalGlobal = (onConfirm) => {
            onConfirmRef.current = onConfirm;
            setIsHoldVisible(true);
        };
        showRejectModalGlobal = (onConfirm) => {
            onConfirmRef.current = onConfirm;
            setIsRejectVisible(true);
        };
        return () => {
            showHoldModalGlobal = null;
            showRejectModalGlobal = null;
        };
    }, []);

    return (
        <>
            {!!isHoldVisible && (
                <HoldSubmitterEducationalModal
                    onClose={dismissHold}
                    onConfirm={dismissHold}
                />
            )}
            {!!isRejectVisible && (
                <HoldOrRejectEducationalModal
                    onClose={dismissReject}
                    onConfirm={dismissReject}
                />
            )}
        </>
    );
}

export {showHoldEducationalModal, showRejectEducationalModal};
export default HoldEducationalModalManager;
