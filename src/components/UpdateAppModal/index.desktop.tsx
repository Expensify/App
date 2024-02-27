import React from 'react';
import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import BaseUpdateAppModal from './BaseUpdateAppModal';
import type UpdateAppModalProps from './types';

function UpdateAppModal({onSubmit}: UpdateAppModalProps) {
    const updateApp = () => {
        onSubmit?.();
        window.electron.send(ELECTRON_EVENTS.START_UPDATE);
    };
    return <BaseUpdateAppModal onSubmit={updateApp} />;
}

UpdateAppModal.displayName = 'UpdateAppModal';

export default UpdateAppModal;
