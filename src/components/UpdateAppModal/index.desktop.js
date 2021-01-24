import React from 'react';
import {ipcRenderer} from 'electron';
import BaseUpdateAppModal from './BaseUpdateAppModal';

const UpdateAppModal = (props) => {
    const onConfirm = () => {
        if (props.onConfirm) {
            props.onConfirm();
        }
        ipcRenderer.sendSync('start-update', props.version);
    };
    return <BaseUpdateAppModal onConfirm={onConfirm} />;
};
UpdateAppModal.propTypes = BaseUpdateAppModal.propTypes;
UpdateAppModal.displayName = 'UpdateAppModal';
export default UpdateAppModal;
