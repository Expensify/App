import PropTypes from 'prop-types';

export default PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
    Component: PropTypes.func,

    // Only applicable when responsive is true
    modalType: PropTypes.string,
    subRoutes: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        Component: PropTypes.func,
        options: PropTypes.shape({
            title: PropTypes.string,
        }),
    })),
}));
