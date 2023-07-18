import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import CONST from '../CONST';
import reportPropTypes from '../pages/reportPropTypes';

const propTypes = {
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
    }),
};

const defaultProps = {
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
    },
};

function DistanceRequest(props) {
    return (
        <Text>Distance Request</Text>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default DistanceRequest;
