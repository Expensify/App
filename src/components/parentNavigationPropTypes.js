import PropTypes from 'prop-types';

export default PropTypes.shape({
    // Title of root report room
    rootReportName: PropTypes.string,

    // Name of workspace, if any
    workspaceName: PropTypes.string,
});
