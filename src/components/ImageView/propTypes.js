import PropTypes from 'prop-types';

const imageViewPropTypes = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** Handles scale changed event in image zoom component. Used on native only */
    // eslint-disable-next-line react/no-unused-prop-types
    onScaleChanged: PropTypes.func.isRequired,

    /** URL to full-sized image */
    url: PropTypes.string.isRequired,

    /** image file name */
    fileName: PropTypes.string.isRequired,

    onError: PropTypes.func,
};

const imageViewDefaultProps = {
    isAuthTokenRequired: false,
    onError: () => {},
};

export {imageViewPropTypes, imageViewDefaultProps};
