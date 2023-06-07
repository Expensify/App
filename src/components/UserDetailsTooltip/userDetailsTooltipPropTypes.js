import PropTypes from 'prop-types';

const propTypes = {
    /** Source image */
    avatarSource: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** User's name */
    name: PropTypes.string,
    /** User's login */
    login: PropTypes.string,
    /** Component that displays the tooltip */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    avatarSource: null,
    name: '',
    login: '',
};

export {propTypes, defaultProps};
