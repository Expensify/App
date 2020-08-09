import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportHistoryItemFragment from './ReportHistoryItemFragment';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';

const propTypes = {
    // The report history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

class ReportHistoryItemMessage extends React.Component {
    render() {
        return (
            <>
                {_.map(_.compact(this.props.historyItem.message), fragment => (
                    <ReportHistoryItemFragment
                        key={_.uniqueId('historyItemFragment', this.props.historyItem.sequenceNumber)}
                        fragment={fragment}
                    />
                ))}
            </>
        );
    }
}

ReportHistoryItemMessage.propTypes = propTypes;
ReportHistoryItemMessage.displayName = 'ReportHistoryItemMessage';

export default ReportHistoryItemMessage;
