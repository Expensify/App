import React from 'react';
import BaseUpdateAppModal from './BaseUpdateAppModal';

const UpdateAppModal = props => (
    <BaseUpdateAppModal
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);
UpdateAppModal.propTypes = BaseUpdateAppModal.propTypes;
UpdateAppModal.displayName = 'UpdateAppModal';
export default UpdateAppModal;
