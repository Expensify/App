import PropTypes from 'prop-types';

/**
 * Text based component that is passed a URL to open onPress
 */
const propTypes = {
    /** The URL to open */
    href: PropTypes.string,

    /** What headers to send to the linked page (usually noopener and noreferrer)
        This is unused in native, but is here for parity with web */
    rel: PropTypes.string,

    /** Used to determine where to open a link ("_blank" is passed for a new tab)
        This is unused in native, but is here for parity with web */
    target: PropTypes.string,

    /** Flag to differentiate attachments and hyperlink. Base on flag link will be treated as a file download or a regular hyperlink */
    isAttachment: PropTypes.bool,

    /** Any children to display */
    children: PropTypes.node,

    /** Display label in case of attachments */
    fileName: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

};

const defaultProps = {
    href: '',
    rel: '',
    target: '',
    isAttachment: false,
    children: null,
    style: {},
    fileName: '',
};

export {propTypes, defaultProps};
