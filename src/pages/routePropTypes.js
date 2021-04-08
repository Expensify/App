import PropTypes from 'prop-types';

export default PropTypes.shape({
    // The accountID and validateCode are passed via the URL
    route: PropTypes.shape({
        // Each parameter passed via the URL
        params: PropTypes.shape({
        }),
    }),
});
