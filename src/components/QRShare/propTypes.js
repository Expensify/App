import PropTypes from 'prop-types';

const qrSharePropTypes = {
    /**
     * The QR code URL
     */
    url: PropTypes.string.isRequired,
    /**
     * The title that is displayed below the QR Code (usually the user or report name)
     */
    title: PropTypes.string.isRequired,
    /**
     * The subtitle which will be shown below the title (usually user email or workspace name)
     * */
    subtitle: PropTypes.string,
    /**
     * The logo which will be display in the middle of the QR code
     */
    logo: PropTypes.oneOfType([PropTypes.shape({uri: PropTypes.string}), PropTypes.number, PropTypes.string]),
};

const defaultProps = {
    subtitle: undefined,
    logo: undefined,
};

export {qrSharePropTypes, defaultProps as qrShareDefaultProps};
