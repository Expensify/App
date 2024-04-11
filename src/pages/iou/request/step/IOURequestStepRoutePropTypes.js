import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '@src/CONST';

export default PropTypes.shape({
    /** Route specific parameters used on this screen via route :iouType/new/category/:reportID? */
    params: PropTypes.shape({
        /** What action is being performed, ie. create, edit */
        action: PropTypes.oneOf(_.values(CONST.IOU.ACTION)),

        /** The type of IOU report, i.e. bill, request, send */
        iouType: PropTypes.oneOf(_.values(CONST.IOU.TYPE)).isRequired,

        /** The ID of the transaction being configured */
        transactionID: PropTypes.string.isRequired,

        /** The report ID of the IOU */
        reportID: PropTypes.string.isRequired,

        /** Index of the waypoint being edited */
        pageIndex: PropTypes.string,

        /** A path to go to when the user presses the back button */
        backTo: PropTypes.string,

        /** Indicates which tag list index was selected */
        tagIndex: PropTypes.string,
    }),
});
