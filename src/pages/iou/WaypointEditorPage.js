import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import WaypointEditor from './WaypointEditor';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** IOU type */
            iouType: PropTypes.string,

            /** Index of the waypoint being edited */
            waypointIndex: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    transactionID: '',
    route: {
        params: {
            iouType: '',
            waypointIndex: '',
        },
    },
};

// This component is responsible for grabbing the transactionID from the IOU key
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that WaypointEditor can subscribe to the transaction.
function WaypointEditorPage({transactionID, route}) {
    return (
        <WaypointEditor
            transactionID={transactionID}
            route={route}
        />
    );
}

WaypointEditorPage.displayName = 'WaypointEditorPage';
WaypointEditorPage.propTypes = propTypes;
WaypointEditorPage.defaultProps = defaultProps;
export default withOnyx({
    // We must provide a default value for transactionID here, otherwise the component won't mount
    // because withOnyx returns null until all the keys are defined
    transactionID: {key: ONYXKEYS.IOU, selector: (iou) => (iou && iou.transactionID) || ''},
})(WaypointEditorPage);
