import React from 'react';
import propTypes from './reportActionItemCommentFragmentPropTypes';
import BaseReportActionItemCommentFragment from './BaseReportActionItemCommentFragment';

const ReportActionItemCommentFragment = ({html, text}) => (
    <BaseReportActionItemCommentFragment html={html} text={text} selectable={false} />
);

ReportActionItemCommentFragment.displayName = 'ReportActionItemCommentFragment';
ReportActionItemCommentFragment.propTypes = propTypes;

export default ReportActionItemCommentFragment;
