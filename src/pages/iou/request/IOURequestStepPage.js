import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import IOURequestStepAmount from './step/IOURequestStepAmount';
import IOURequestStepCategory from './step/IOURequestStepCategory';
import IOURequestStepConfirmation from './step/IOURequestStepConfirmation';
import IOURequestStepCurrency from './step/IOURequestStepCurrency';
import IOURequestStepDate from './step/IOURequestStepDate';
import IOURequestStepDescription from './step/IOURequestStepDescription';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestStepMerchant from './step/IOURequestStepMerchant';
import IOURequestStepParticipants from './step/IOURequestStepParticipants';
import IOURequestStepRoutePropTypes from './step/IOURequestStepRoutePropTypes';
import IOURequestStepScan from './step/IOURequestStepScan';
import IOURequestStepTag from './step/IOURequestStepTag';
import IOURequestStepWaypoint from './step/IOURequestStepWaypoint';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    report: reportPropTypes,
};
const defaultProps = {
    report: {},
};

function IOURequestStepPage({
    report,
    route,
    route: {
        params: {iouType, step},
    },
}) {
    console.log('[tim 1');
    const iouTypeParamIsInvalid = !_.contains(_.values(CONST.IOU.TYPE), iouType);
    const stepParamIsInvalid = !_.contains(_.values(CONST.IOU.REQUEST_STEPS), step);
    const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);
    if (iouTypeParamIsInvalid || stepParamIsInvalid || !canUserPerformWriteAction) {
        return <FullPageNotFoundView shouldShow />;
    }

    return (
        <>
            {step === CONST.IOU.REQUEST_STEPS.AMOUNT && <IOURequestStepAmount route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.CATEGORY && <IOURequestStepCategory route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.CONFIRMATION && <IOURequestStepConfirmation route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.CURRENCY && <IOURequestStepCurrency route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.DATE && <IOURequestStepDate route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.DESCRIPTION && <IOURequestStepDescription route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.DISTANCE && <IOURequestStepDistance route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.MERCHANT && <IOURequestStepMerchant route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.PARTICIPANTS && <IOURequestStepParticipants route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.SCAN && <IOURequestStepScan route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.TAG && <IOURequestStepTag route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.WAYPOINT && <IOURequestStepWaypoint route={route} />}
        </>
    );
}

IOURequestStepPage.displayName = 'IOURequestStepPage';
IOURequestStepPage.propTypes = propTypes;
IOURequestStepPage.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
    },
})(IOURequestStepPage);
