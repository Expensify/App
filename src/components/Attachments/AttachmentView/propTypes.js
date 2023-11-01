import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '../propTypes';

const attachmentViewPropTypes = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    /** File object can be an instance of File or Object */
    file: AttachmentsPropTypes.attachmentFilePropType,

    /** Whether this view is the active screen  */
    isFocused: PropTypes.bool,

    /** Whether this AttachmentView is shown as part of a AttachmentCarousel */
    isUsedInCarousel: PropTypes.bool,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Handles scale changed event */
    onScaleChanged: PropTypes.func,

    /** Whether this AttachmentView is shown as part of an AttachmentModal */
    isUsedInAttachmentModal: PropTypes.bool,
};

const attachmentViewDefaultProps = {
    isAuthTokenRequired: false,
    file: {
        name: '',
    },
    isFocused: false,
    isUsedInCarousel: false,
    onPress: undefined,
    onScaleChanged: () => {},
    isUsedInAttachmentModal: false,
};

export {attachmentViewPropTypes, attachmentViewDefaultProps};
