import PropTypes from 'prop-types';
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

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU being created */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)).isRequired,

            /** The optimistic ID of a new transaction that is being created */
            transactionID: PropTypes.string.isRequired,

            /** Which step the user is modifying */
            step: PropTypes.oneOf(_.values(CONST.IOU.REQUEST_STEPS)),

            /** reportID if a transaction is attached to a specific report */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

function IOURequestStepPage({
    route,
    route: {
        params: {step},
    },
}) {
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
            {step === CONST.IOU.REQUEST_STEPS.MERCHANT && null}
            {step === CONST.IOU.REQUEST_STEPS.WAYPOINT && <IOURequestStepWaypoint route={route} />}
            {step === CONST.IOU.REQUEST_STEPS.DISTANCE && <IOURequestStepDistance route={route} />}
            {!_.contains(_.values(CONST.IOU.REQUEST_STEPS), step) && <FullPageNotFoundView shouldShow />}
        </>
    );
}

IOURequestStepPage.displayName = 'IOURequestStepPage';
IOURequestStepPage.propTypes = propTypes;

export default IOURequestStepPage;
