import {stylePropTypes} from '@styles';
import PropTypes from 'prop-types';

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
