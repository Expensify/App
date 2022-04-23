import React from 'react';
import AttachmentModal from './AttachmentModal';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    ...withLocalizePropTypes,
};

const UploadAttachmentModal = props => (
    <AttachmentModal
        headerTitle={props.translate('reportActionCompose.sendAttachment')}
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...props}
    />
);

UploadAttachmentModal.propTypes = propTypes;
UploadAttachmentModal.displayName = 'UploadAttachmentModal';
export default withLocalize(UploadAttachmentModal);
