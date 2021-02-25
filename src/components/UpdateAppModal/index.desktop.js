import React from 'react';
import {ipcRenderer} from 'electron';
import BaseUpdateAppModal from './BaseUpdateAppModal';

const UpdateAppModal = (props) => {
    const onSubmit = () => {
        if (props.onSubmit) {
            props.onSubmit();
        }
        ipcRenderer.sendSync('start-update', props.version);
    };
    return <BaseUpdateAppModal onSubmit={onSubmit} />;
};
UpdateAppModal.propTypes = BaseUpdateAppModal.propTypes;
UpdateAppModal.displayName = 'UpdateAppModal';
export default UpdateAppModal;
