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

    // Allows setting of attachment modal data
    setAttachmentModalData: PropTypes.func.isRequired
};

const ReportActionItem = props => (
    <>
        {!props.displayAsGroup
            ? <ReportActionItemSingle action={props.action} setAttachmentModalData={props.setAttachmentModalData} />
            : <ReportActionItemGrouped action={props.action} setAttachmentModalData={props.setAttachmentModalData} />}
    </>
);

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
