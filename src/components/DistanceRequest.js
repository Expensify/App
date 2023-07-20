import React, { useEffect } from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import Text from './Text';
import CONST from '../CONST';
import reportPropTypes from '../pages/reportPropTypes';
import * as IOU from '../libs/actions/IOU';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';


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
    const transactionID = lodashGet(props.iou, 'transactionID', '');
    useEffect(() => {
        if (transactionID) {
            return;
        }
        IOU.createEmptyTransaction();
    }, [transactionID]);

    return (
        <View style={[styles.flex1, styles.flexColumn, styles.w100, styles.alignItemsCenter, styles.mt4]}>
            <Text>Distance Request</Text>
            <Text>transactionID: {transactionID}</Text>
        </View>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
    },
})(DistanceRequest);
