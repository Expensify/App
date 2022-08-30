import PropTypes from 'prop-types';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** The URL of the attachment */
    source: PropTypes.string,

    /** Filename for attachments. */
    displayName: PropTypes.string,

    /** Any additional styles to apply */
    style: stylePropTypes,
};

const defaultProps = {
    source: '',
    style: {},
    displayName: '',
};

export {propTypes, defaultProps};
