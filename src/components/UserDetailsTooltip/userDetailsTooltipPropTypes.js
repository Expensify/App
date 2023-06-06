import PropTypes from 'prop-types';

const propTypes = {
    /** Source image */
    avatarSource: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    /** User's name */
    name: PropTypes.string,
    /** User's handle */
    handle: PropTypes.string,
    /** Component that displays the tooltip */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    avatarSource: null,
    name: '',
    handle: '',
};

export {propTypes, defaultProps};
