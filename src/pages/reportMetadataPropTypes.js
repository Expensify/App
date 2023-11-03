import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Are we loading newer report actions? */
    isLoadingNewerReportActions: PropTypes.bool,

    /** Are we loading older report actions? */
    isLoadingOlderReportActions: PropTypes.bool,

    /** Flag to check if the report actions data are loading */
    isLoadingInitialReportActions: PropTypes.bool,
});
