import _ from 'underscore';
import React, {memo} from 'react';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionPropTypes from './ReportActionPropTypes';

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
ReportActionItem.displayName = 'ReportActionItem';

export default memo(ReportActionItem, (prevProps, nextProps) => (
    prevProps.displayAsGroup === nextProps.displayAsGroup && _.isEqual(prevProps.action, nextProps.action)
));
