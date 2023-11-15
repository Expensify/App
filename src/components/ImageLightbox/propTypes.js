import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '@components/Attachments/propTypes';
import * as Constants from './Constants';

const scalePropTypes = {
    minZoomScale: PropTypes.number,
    maxZoomScale: PropTypes.number,
};

const imageTransformerPropTypes = {
    ...scalePropTypes,

    canvasWidth: PropTypes.number.isRequired,
    canvasHeight: PropTypes.number.isRequired,
    imageWidth: PropTypes.number,
    imageHeight: PropTypes.number,
    imageScaleX: PropTypes.number,
    imageScaleY: PropTypes.number,
    scaledImageWidth: PropTypes.number,
    scaledImageHeight: PropTypes.number,
    isActive: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

const scaleDefaultProps = {
    minZoomScale: Constants.DEFAULT_MIN_ZOOM_SCALE,
    maxZoomScale: Constants.DEFAULT_MAX_ZOOM_SCALE,
};

const imageTransformerDefaultProps = {
    ...scaleDefaultProps,

    isActive: true,
    imageWidth: 0,
    imageHeight: 0,
    imageScaleX: 1,
    imageScaleY: 1,
    scaledImageWidth: 0,
    scaledImageHeight: 0,
    minZoomScale: Constants.DEFAULT_MIN_ZOOM_SCALE,
    maxZoomScale: Constants.DEFAULT_MAX_ZOOM_SCALE,
};

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const imageLightboxPropTypes = {
    ...scalePropTypes,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    isActive: PropTypes.bool,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const imageLightboxDefaultProps = {
    ...scaleDefaultProps,

    isAuthTokenRequired: false,
    isActive: true,
    onPress: () => {},
    style: {},
};

export {scalePropTypes, imageTransformerPropTypes, imageLightboxPropTypes, scaleDefaultProps, imageTransformerDefaultProps, imageLightboxDefaultProps};
