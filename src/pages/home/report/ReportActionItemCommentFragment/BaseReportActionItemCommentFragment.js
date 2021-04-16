import React from 'react';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import reportActionItemCommentFragmentPropTypes from './reportActionItemCommentFragmentPropTypes';
import RenderHTML from '../../../../components/RenderHTML';
import Text from '../../../../components/Text';

const propTypes = {
    ...reportActionItemCommentFragmentPropTypes,

    // Whether the fragment should be selectable for native copy/paste functionality
    selectable: PropTypes.bool.isRequired,
};

const BaseReportActionItemCommentFragment = ({html, text, selectable}) => (
    html !== text
        ? <RenderHTML html={html} debug={false} defaultTextProps={selectable ? {selectable} : {}} />
        : <Text selectable={selectable}>{Str.htmlDecode(text)}</Text>
);

BaseReportActionItemCommentFragment.propTypes = propTypes;
BaseReportActionItemCommentFragment.displayName = 'ReportActionItemCommentFragment';

export default BaseReportActionItemCommentFragment;
