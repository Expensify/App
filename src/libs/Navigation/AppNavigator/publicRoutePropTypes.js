import PropTypes from 'prop-types';

export default PropTypes.shape({
    name: PropTypes.string,
    options: PropTypes.shape({
        headerShown: PropTypes.bool,
        animationTypeForReplace: PropTypes.string,
        title: PropTypes.string,
    }),
    Component: PropTypes.func,
});
