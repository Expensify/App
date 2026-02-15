import React from 'react';
import BaseUpdateAppModal from './BaseUpdateAppModal';
import type UpdateAppModalProps from './types';

function UpdateAppModal(props: UpdateAppModalProps) {
    return (
        <BaseUpdateAppModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default UpdateAppModal;
