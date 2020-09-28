import React from 'react';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,
};

const ReportActionItem = props => (
    <>
        {!props.displayAsGroup
            ? <ReportActionItemSingle action={props.action} />
            : <ReportActionItemGrouped action={props.action} />}
    </>
);

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
