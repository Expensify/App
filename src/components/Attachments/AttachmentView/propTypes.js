import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '../propTypes';

const attachmentViewPropTypes = {
    /** Attachment to display */
    item: AttachmentsPropTypes.attachmentPropType,

    /** Whether this AttachmentView is shown as part of a AttachmentCarousel */
    isUsedInCarousel: PropTypes.bool,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Handles scale changed event */
    onScaleChanged: PropTypes.func,
};

const attachmentViewDefaultProps = {
    item: {
        isAuthTokenRequired: false,
        file: {
            name: '',
        },
    },
    isUsedInCarousel: false,
    onPress: undefined,
    onScaleChanged: () => {},
};

export {attachmentViewPropTypes, attachmentViewDefaultProps};
