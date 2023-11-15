import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '@components/Attachments/propTypes';

const attachmentViewPropTypes = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    /** File object can be an instance of File or Object */
    file: AttachmentsPropTypes.attachmentFilePropType,

    /** Whether this AttachmentView is shown as part of a AttachmentCarousel */
    isUsedInCarousel: PropTypes.bool,

    /** Whether this AttachmentView is shown as part of an AttachmentModal */
    isUsedInAttachmentModal: PropTypes.bool,

    /** Whether this view is the active screen  */
    isFocused: PropTypes.bool,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Handles scale changed event */
    onScaleChanged: PropTypes.func,
};

const attachmentViewDefaultProps = {
    isAuthTokenRequired: false,
    file: {
        name: '',
    },
    isUsedInCarousel: false,
    isFocused: false,
    isUsedInAttachmentModal: false,
    onPress: undefined,
    onScaleChanged: () => {},
};

export {attachmentViewPropTypes, attachmentViewDefaultProps};
