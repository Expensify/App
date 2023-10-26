import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Are we loading more report actions? */
    isLoadingMoreReportActions: PropTypes.bool,

    /** Flag to check if the report actions data are loading */
    isLoadingReportActions: PropTypes.bool,
});
