import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as IOU from '../../libs/actions/IOU';
import ONYXKEYS from '../../ONYXKEYS';
import DistanceRequest from '../../components/DistanceRequest';
import CONST from '../../CONST';
import reportPropTypes from '../reportPropTypes';

const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
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
};

const defaultProps = {
    transactionID: '',
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    report: {},
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
        transactionID: '',
    },
};

function DistanceRequestPage({route, report, iou, transactionID}) {
    useEffect(() => {
        if (transactionID) {
            return;
        }
        IOU.createEmptyTransaction();
    }, [transactionID]);

    return (
        <DistanceRequest
            route={route}
            report={report}
            iou={iou}
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
