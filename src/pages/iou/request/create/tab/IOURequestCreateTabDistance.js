import React from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../../ONYXKEYS';
import transactionPropTypes from '../../../../../components/transactionPropTypes';
import IOURequestStepDistance from '../../step/IOURequestStepDistance';
import Navigation from '../../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../../ROUTES';
import CONST from '../../../../../CONST';
import compose from '../../../../../libs/compose';
import reportPropTypes from '../../../../reportPropTypes';
import * as IOU from '../../../../../libs/actions/IOU';

const propTypes = {
    /* Onyx Props */
    /** The transaction object storing all the data for creation */
    transaction: transactionPropTypes,

    report: reportPropTypes,
};

const defaultProps = {
    transaction: {},
    report: {},
};

function IOURequestCreateTabDistance({transaction: {transactionID, reportID}, report}) {
    /**
     * @param {Number} index of the waypoint that the user needs to be taken to
     */
    const navigateToWaypointPage = (index) => {
        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST, CONST.IOU.REQUEST_STEPS.WAYPOINT, transactionID, reportID, index));
    };

    const goToNextStep = () => {
        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, we know the participants already and can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
            IOU.autoAssignParticipants(transactionID, report);
            Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST, CONST.IOU.REQUEST_STEPS.PARTICIPANTS, transactionID, reportID));
    };

    return (
        <IOURequestStepDistance
            transactionID={transactionID}
            onWaypointSelect={navigateToWaypointPage}
            onSubmit={goToNextStep}
        />
    );
}

IOURequestCreateTabDistance.propTypes = propTypes;
IOURequestCreateTabDistance.defaultProps = defaultProps;
IOURequestCreateTabDistance.displayName = 'IOURequestCreateTabDistance';

export default compose(
    withOnyx({
        transaction: {
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        report: {
            key: ({transaction: {reportID = '0'}}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
    }),
)(IOURequestCreateTabDistance);
