import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';

import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import CONST from '../../../CONST';
import IOURequestFieldWaypoint from './field/IOURequestFieldWaypoint';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU being created */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)).isRequired,

            /** The optimistic ID of a new transaction that is being created */
            transactionID: PropTypes.string.isRequired,

            /** Which field the user is modifying */
            field: PropTypes.oneOf(['amount', 'participants', 'confirmation', 'date', 'currency', 'description', 'category', 'tag', 'merchant', 'waypoint', 'address']),

            /** reportID if a transaction is attached to a specific report */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {};

function IOURequestFieldPage({
    route,
    route: {
        params: {field},
    },
}) {
    if (field === 'amount') {
        return null;
    }

    if (field === 'participants') {
        return null;
    }

    if (field === 'confirmation') {
        return null;
    }

    if (field === 'date') {
        return null;
    }

    if (field === 'currency') {
        return null;
    }

    if (field === 'description') {
        return null;
    }

    if (field === 'category') {
        return null;
    }

    if (field === 'tag') {
        return null;
    }

    if (field === 'merchant') {
        return null;
    }

    if (field === 'waypoint') {
        return <IOURequestFieldWaypoint route={route} />;
    }

    if (field === 'address') {
        return null;
    }

    return <FullPageNotFoundView shouldShow />;
}

IOURequestFieldPage.displayName = 'IOURequestFieldPage';
IOURequestFieldPage.propTypes = propTypes;
IOURequestFieldPage.defaultProps = defaultProps;
export default IOURequestFieldPage;
