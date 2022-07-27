import PropTypes from 'prop-types';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** The URL of the attachment */
    source: PropTypes.string,

    /** Filename in case of attachments, anchor text in case of URLs or emails. */
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
