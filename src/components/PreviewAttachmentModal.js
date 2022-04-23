import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import AttachmentModal from './AttachmentModal';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Determines title of the modal header depending on if we are viewing a profile picture or not */
    isProfilePicture: PropTypes.bool,

    /** DisplayName to be used as headerTitle if isProfilePicture is true. */
    displayName: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isProfilePicture: false,
    displayName: null,
};

const PreviewAttachmentModal = (props) => {
    const propsToPass = _.omit(props, 'displayName', 'isProfilePicture');
    return (
        <AttachmentModal
            headerTitle={props.isProfilePicture ? props.displayName : props.translate('common.attachment')}
            allowDownload={!props.isProfilePicture}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...propsToPass}
        />
    );
};

PreviewAttachmentModal.propTypes = propTypes;
PreviewAttachmentModal.defaultProps = defaultProps;
PreviewAttachmentModal.displayName = 'PreviewAttachmentModal';
export default withLocalize(PreviewAttachmentModal);
