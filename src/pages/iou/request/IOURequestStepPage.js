import React from 'react';
import _ from 'underscore';

import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import CONST from '../../../CONST';
import IOURequestStepWaypoint from './step/IOURequestStepWaypoint';
import IOURequestStepParticipants from './step/IOURequestStepParticipants';
import IOURequestStepConfirmation from './step/IOURequestStepConfirmation';
import IOURequestStepDescription from './step/IOURequestStepDescription';
import IOURequestStepDate from './step/IOURequestStepDate';
import IOURequestStepCategory from './step/IOURequestStepCategory';
import IOURequestStepTag from './step/IOURequestStepTag';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestStepCurrency from './step/IOURequestStepCurrency';
import IOURequestStepAmount from './step/IOURequestStepAmount';
import IOURequestStepMerchant from './step/IOURequestStepMerchant';
import IOURequestStepRoutePropTypes from './step/IOURequestStepRoutePropTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,
};

function IOURequestStepPage({
    route,
    route: {
        params: {iouType, step},
    },
}) {
    const iouTypeParamIsInvalid = !_.contains(_.values(CONST.IOU.TYPE), iouType);
    const stepParamIsInvalid = !_.contains(_.values(CONST.IOU.REQUEST_STEPS), step);
    if (iouTypeParamIsInvalid || stepParamIsInvalid) {
        return <FullPageNotFoundView shouldShow />;
    }
    return (
        <>
            {step === CONST.IOU.REQUEST_STEPS.AMOUNT && <IOURequestStepAmount route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.PARTICIPANTS && <IOURequestStepParticipants route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.CONFIRMATION && <IOURequestStepConfirmation route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.DATE && <IOURequestStepDate route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.CURRENCY && <IOURequestStepCurrency route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.DESCRIPTION && <IOURequestStepDescription route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.CATEGORY && <IOURequestStepCategory route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.TAG && <IOURequestStepTag route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.MERCHANT && <IOURequestStepMerchant route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.WAYPOINT && <IOURequestStepWaypoint route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.DISTANCE && <IOURequestStepDistance route={route} />}
        </>
    );
}

IOURequestStepPage.displayName = 'IOURequestStepPage';
IOURequestStepPage.propTypes = propTypes;

export default IOURequestStepPage;
