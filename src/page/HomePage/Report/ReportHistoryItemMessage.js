import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportHistoryItemFragment from './ReportHistoryItemFragment';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';

const propTypes = {
    // The report history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,

    // Current users auth token
    authToken: PropTypes.string.isRequired,
};

const ReportHistoryItemMessage = ({historyItem, authToken}) => (
    <>
        {_.map(_.compact(historyItem.message), fragment => (
            <ReportHistoryItemFragment
                key={_.uniqueId('historyItemFragment', historyItem.sequenceNumber)}
                fragment={fragment}
                authToken={authToken}
            />
        ))}
    </>
);

ReportHistoryItemMessage.propTypes = propTypes;
ReportHistoryItemMessage.displayName = 'ReportHistoryItemMessage';

export default ReportHistoryItemMessage;
