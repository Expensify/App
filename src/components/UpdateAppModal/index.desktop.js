import React from 'react';
import * as AppUpdate from '@libs/actions/AppUpdate';
import BaseUpdateAppModal from './BaseUpdateAppModal';
import {propTypes} from './updateAppModalPropTypes';

function UpdateAppModal(props) {
    const updateApp = () => {
        if (props.onSubmit) {
            props.onSubmit();
        }
        AppUpdate.updateApp();
    };
    return <BaseUpdateAppModal onSubmit={updateApp} />;
}
UpdateAppModal.propTypes = propTypes;
UpdateAppModal.displayName = 'UpdateAppModal';
export default UpdateAppModal;
