import React from 'react';
import {ipcRenderer} from 'electron';
import BaseUpdateAppModal from './BaseUpdateAppModal';
import {propTypes} from './UpdateAppModalPropTypes';

const UpdateAppModal = (props) => {
    const updateApp = () => {
        if (props.onSubmit) {
            props.onSubmit();
        }
        ipcRenderer.sendSync('start-update');
    };
    return <BaseUpdateAppModal onSubmit={updateApp} />;
};
UpdateAppModal.propTypes = propTypes;
UpdateAppModal.displayName = 'UpdateAppModal';
export default UpdateAppModal;
