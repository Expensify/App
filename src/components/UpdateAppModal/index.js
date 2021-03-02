import React from 'react';
import BaseUpdateAppModal from './BaseUpdateAppModal';
import {propTypes} from './UpdateAppModalPropTypes';

const UpdateAppModal = props => (
    <BaseUpdateAppModal
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);
UpdateAppModal.propTypes = propTypes;
UpdateAppModal.displayName = 'UpdateAppModal';
export default UpdateAppModal;
