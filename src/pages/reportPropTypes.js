import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Name of the report */
    reportName: PropTypes.string,

    /** List of primarylogins of participants of the report */
    participants: PropTypes.arrayOf(PropTypes.string),

    /** List of icons for report participants */
    icons: PropTypes.arrayOf(PropTypes.string),

    /** ID of the report */
    reportID: PropTypes.string,
});
