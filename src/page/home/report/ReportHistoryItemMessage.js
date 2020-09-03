import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportHistoryItemFragment from './ReportHistoryItemFragment';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';

const propTypes = {
    // The report history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

const ReportHistoryItemMessage = ({historyItem}) => (
    <>
        {_.map(_.compact(historyItem.message), fragment => (
            <ReportHistoryItemFragment
                key={_.uniqueId('historyItemFragment', historyItem.sequenceNumber)}
                fragment={fragment}
            />
        ))}
    </>
);

ReportHistoryItemMessage.propTypes = propTypes;
ReportHistoryItemMessage.displayName = 'ReportHistoryItemMessage';

export default ReportHistoryItemMessage;
