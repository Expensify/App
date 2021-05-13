import React from 'react';
import propTypes from './reportActionItemCommentFragmentPropTypes';
import BaseReportActionItemCommentFragment from './BaseReportActionItemCommentFragment';

const ReportActionItemCommentFragment = ({html, text, isEdited}) => (
    <BaseReportActionItemCommentFragment html={html} text={text} isEdited={isEdited} selectable={false} />
);

ReportActionItemCommentFragment.displayName = 'ReportActionItemCommentFragment';
ReportActionItemCommentFragment.propTypes = propTypes;

export default ReportActionItemCommentFragment;
