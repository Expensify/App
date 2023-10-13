import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import * as IOU from '../../libs/actions/IOU';
import ONYXKEYS from '../../ONYXKEYS';
import DistanceRequest from '../../components/DistanceRequest';
import reportPropTypes from '../reportPropTypes';
import CONST from '../../CONST';
import {iouPropTypes} from './propTypes';

const propTypes = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Passed from the navigator */
    route: PropTypes.shape({
        /** Parameters the route gets */
        params: PropTypes.shape({
            /** Type of IOU */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.TYPE)),
            /** Id of the report on which the distance request is being created */
            reportID: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    iou: {},
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
    const iouType = lodashGet(route, 'params.iouType', 'request');

    useEffect(() => {
        if (iou.transactionID) {
            return;
        }
        IOU.setUpDistanceTransaction();
    }, [iou.transactionID]);

    return (
        <DistanceRequest
            report={report}
            route={route}
            transactionID={iou.transactionID}
            onSubmit={() => IOU.navigateToNextPage(iou, iouType, report)}
        />
    );
}

NewDistanceRequestPage.displayName = 'NewDistanceRequestPage';
NewDistanceRequestPage.propTypes = propTypes;
NewDistanceRequestPage.defaultProps = defaultProps;
export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID')}`,
    },
})(NewDistanceRequestPage);
