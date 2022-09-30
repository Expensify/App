import PropTypes from 'prop-types';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** The URL to open */
    href: PropTypes.string,

    /** What headers to send to the linked page (usually noopener and noreferrer)
        This is unused in native, but is here for parity with web */
    rel: PropTypes.string,

    /** Used to determine where to open a link ("_blank" is passed for a new tab)
        This is unused in native, but is here for parity with web */
    target: PropTypes.string,

    /** Any children to display */
    children: PropTypes.node,

    /** Anchor text of URLs or emails. */
    displayName: PropTypes.string,

    /** Any additional styles to apply */
    style: stylePropTypes,

    /** Press handler for the link, when not passed, default href is used to create a link like behaviour */
    onPress: PropTypes.func,
};

const defaultProps = {
    href: '',
    rel: '',
    target: '',
    children: null,
    style: {},
    displayName: '',
    onPress: undefined,
};

export {propTypes, defaultProps};
