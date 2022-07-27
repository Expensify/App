import PropTypes from 'prop-types';

/**
 * Text based component that is passed a URL to open onPress
 */
const propTypes = {
    /** The URL to open */
    href: PropTypes.string,

    /** Filename in case of attachments, anchor text in case of URLs or emails. */
    displayName: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    href: '',
    style: {},
    displayName: '',
};

export {propTypes, defaultProps};
