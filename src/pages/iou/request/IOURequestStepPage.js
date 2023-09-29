import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';

import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import CONST from '../../../CONST';
import IOURequestStepWaypoint from './step/IOURequestStepWaypoint';
import IOURequestStepParticipants from './step/IOURequestStepParticipants';

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

const defaultProps = {};

function IOURequestStepPage({
    route,
    route: {
        params: {step},
    },
}) {
    if (step === CONST.IOU.REQUEST_STEPS.AMOUNT) {
        return null;
    }

    if (step === 'participants') {
        return <IOURequestStepParticipants route={route} />;
    }

    if (step === 'confirmation') {
        return null;
    }

    if (step === 'date') {
        return null;
    }

    if (step === 'currency') {
        return null;
    }

    if (step === 'description') {
        return null;
    }

    if (step === 'category') {
        return null;
    }

    if (step === 'tag') {
        return null;
    }

    if (step === 'merchant') {
        return null;
    }

    if (step === 'waypoint') {
        return <IOURequestStepWaypoint route={route} />;
    }

    if (step === 'address') {
        return null;
    }

    return <FullPageNotFoundView shouldShow />;
}

IOURequestStepPage.displayName = 'IOURequestStepPage';
IOURequestStepPage.propTypes = propTypes;
IOURequestStepPage.defaultProps = defaultProps;
export default IOURequestStepPage;
