import React from 'react';
import AttachmentModalBase from './AttachmentModalBase';
import propTypes from './attachmentModalPropTypes';

const defaultProps = {
    sourceURL: null,
    isAuthTokenRequired: false,
};

const AttachmentModal = React.forwardRef((props, ref) => (
    <AttachmentModalBase
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    >
        {props.children}
    </AttachmentModalBase>
));

AttachmentModal.propTypes = propTypes;
AttachmentModal.defaultProps = defaultProps;
AttachmentModal.displayName = 'AttachmentModal';

export default AttachmentModal;
