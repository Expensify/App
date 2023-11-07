import React from 'react';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';
import BaseUpdateAppModal from './BaseUpdateAppModal';
import {propTypes} from './updateAppModalPropTypes';

function UpdateAppModal(props) {
    const updateApp = () => {
        if (props.onSubmit) {
            props.onSubmit();
        }
        window.electron.send(ELECTRON_EVENTS.START_UPDATE);
    };
    return <BaseUpdateAppModal onSubmit={updateApp} />;
}
UpdateAppModal.propTypes = propTypes;
UpdateAppModal.displayName = 'UpdateAppModal';
export default UpdateAppModal;
