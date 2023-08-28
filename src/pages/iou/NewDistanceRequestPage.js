import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import * as IOU from '../../libs/actions/IOU';
import ONYXKEYS from '../../ONYXKEYS';
import DistanceRequest from '../../components/DistanceRequest';
import reportPropTypes from '../reportPropTypes';
import CONST from '../../CONST';

const propTypes = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        merchant: PropTypes.string,
        created: PropTypes.string,
        participants: PropTypes.arrayOf(
            PropTypes.shape({
                accountID: PropTypes.number,
                login: PropTypes.string,
                isPolicyExpenseChat: PropTypes.bool,
                isOwnPolicyExpenseChat: PropTypes.bool,
                selected: PropTypes.bool,
            }),
        ),
        transactionID: PropTypes.string,
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Passed from the navigator */
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    iou: {
        id: '',
        amount: 0,
        created: '',
        merchant: '',
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    report: {},
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
};

// This component is responsible for getting the transactionID from the IOU key, or creating the transaction if it doesn't exist yet, and then passing the transactionID.
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that DistanceRequest can subscribe to the transaction.
function NewDistanceRequestPage({iou, report, route}) {
    const iouType = lodashGet(route, 'params.iouType', '');

    useEffect(() => {
        if (iou.transactionID) {
            return;
        }
        IOU.createEmptyTransaction();
    }, [iou.transactionID]);

    return (
        <DistanceRequest
            iouType={iouType}
            report={report}
            transactionID={iou.transactionID}
            onSubmit={() => IOU.navigateToNextPage(iou, iouType, report.reportID, report)}
        />
    );
}

NewDistanceRequestPage.displayName = 'NewDistanceRequestPage';
NewDistanceRequestPage.propTypes = propTypes;
NewDistanceRequestPage.defaultProps = defaultProps;
export default withOnyx({
    // We must provide a default value for transactionID here, otherwise the component won't mount
    // because withOnyx returns null until all the keys are defined
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
    },
})(NewDistanceRequestPage);
