import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '@components/Attachments/propTypes';

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

    /** When "isUsedInCarousel" is set to true, determines whether there is only one item in the carousel */
    isSingleCarouselItem: PropTypes.bool,

    /** Whether this AttachmentView is shown as part of an AttachmentModal */
    isUsedInAttachmentModal: PropTypes.bool,

    /** The index of the carousel item */
    carouselItemIndex: PropTypes.number,

    /** The index of the currently active carousel item */
    carouselActiveItemIndex: PropTypes.number,

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
    isFocused: false,
    isUsedInCarousel: false,
    isSingleCarouselItem: false,
    carouselItemIndex: 0,
    carouselActiveItemIndex: 0,
    isSingleElement: false,
    isUsedInAttachmentModal: false,
    onPress: undefined,
    onScaleChanged: () => {},
};

export {attachmentViewPropTypes, attachmentViewDefaultProps};
