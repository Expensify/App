import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as IOU from '../../libs/actions/IOU';
import ONYXKEYS from '../../ONYXKEYS';
import DistanceRequest from '../../components/DistanceRequest';
import reportPropTypes from '../reportPropTypes';

const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** The report on which the request is initiated on */
    report: reportPropTypes,
};

const defaultProps = {
    transactionID: '',
    report: {},
};

// This component is responsible for getting the transactionID from the IOU key, or creating the transaction if it doesn't exist yet, and then passing the transactionID.
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that DistanceRequest can subscribe to the transaction.
function DistanceRequestPage({report, transactionID}) {
    useEffect(() => {
        if (transactionID) {
            return;
        }
        IOU.createEmptyTransaction();
    }, [transactionID]);

    return (
        <DistanceRequest
            report={report}
            transactionID={transactionID}
        />
    );
}

DistanceRequestPage.displayName = 'DistanceRequestPage';
DistanceRequestPage.propTypes = propTypes;
DistanceRequestPage.defaultProps = defaultProps;
export default withOnyx({
    // We must provide a default value for transactionID here, otherwise the component won't mount
    // because withOnyx returns null until all the keys are defined
    transactionID: {key: ONYXKEYS.IOU, selector: (iou) => (iou && iou.transactionID) || ''},
})(DistanceRequestPage);
