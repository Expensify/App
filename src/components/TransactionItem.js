import React from 'react';
import PropTypes from 'prop-types';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemIOUPreview from '../components/ReportActionItemIOUPreview';

const propTypes = {
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Transaction to display
    transaction: PropTypes.shape({

        // The transaction currency
        currency: PropTypes.string,

        // The transaction comment
        comment: PropTypes.string,

        // The transaction amount
        amount: PropTypes.number,
    }).isRequired,
};

const defaultProps = {
    iouReport: {
        total: 0,
    },
};

const TransactionItem = props => (
    <ReportActionItemIOUPreview
            action={props.action}
            isMostRecentIOUReport={false}// shouldDIsplayPreviewBox
    />

);

TransactionItem.displayName = 'TransactionItem';
TransactionItem.propTypes = propTypes;
TransactionItem.defaultProps = defaultProps;
export default TransactionItem;

