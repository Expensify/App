import React from 'react';
import BaseUpdateAppModal from './BaseUpdateAppModal';
import {propTypes} from './updateAppModalPropTypes';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';

const UpdateAppModal = (props) => {
    const updateApp = () => {
        if (props.onSubmit) {
            props.onSubmit();
        }
        window.electronContextBridge.send(ELECTRON_EVENTS.START_UPDATE);
    };
    return <BaseUpdateAppModal onSubmit={updateApp} />;
};
UpdateAppModal.propTypes = propTypes;
UpdateAppModal.displayName = 'UpdateAppModal';
export default UpdateAppModal;
