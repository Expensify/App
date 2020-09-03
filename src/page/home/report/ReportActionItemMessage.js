import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionItemFragment from './ReportActionItemFragment';
import ReportHistoryPropsTypes from './ReportActionPropsTypes';

const propTypes = {
    // The report history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

const ReportActionItemMessage = ({historyItem}) => (
    <>
        {_.map(_.compact(historyItem.message), fragment => (
            <ReportActionItemFragment
                key={_.uniqueId('historyItemFragment', historyItem.sequenceNumber)}
                fragment={fragment}
            />
        ))}
    </>
);

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default ReportActionItemMessage;
