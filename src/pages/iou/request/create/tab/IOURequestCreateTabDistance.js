import React from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../../ONYXKEYS';
import transactionPropTypes from '../../../../../components/transactionPropTypes';
import IOURequestFieldDistance from '../../field/IOURequestFieldDistance';
import Navigation from '../../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../../ROUTES';
import CONST from '../../../../../CONST';

const propTypes = {
    /* Onyx Props */
    /** The transaction object storing all the data for creation */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function IOURequestCreateTabDistance({transaction}) {
    /**
     * @param {Number} index of the waypoint being clicked on
     */
    const navigateToWaypointPage = (index) => {
        Navigation.navigate(ROUTES.MONEE_REQUEST_FIELD.getRoute(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST, transaction.transactionID, transaction.reportID, 'waypoint', index));
    };
    const goToNextStep = () => {
        // @TODO figure this out
        console.log('tbd what the next step is');
    };

    return (
        <IOURequestFieldDistance
            transactionID={transaction.transactionID}
            onWaypointSelect={navigateToWaypointPage}
            onSubmit={goToNextStep}
        />
    );
}

IOURequestCreateTabDistance.propTypes = propTypes;
IOURequestCreateTabDistance.defaultProps = defaultProps;
IOURequestCreateTabDistance.displayName = 'IOURequestCreateTabDistance';

export default withOnyx({
    transaction: {
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
    },
})(IOURequestCreateTabDistance);
