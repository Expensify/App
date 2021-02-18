import React, {memo} from 'react';
import propTypes from './ReportActionItemRowPropTypes';
import ReportActionItem from '../ReportActionItem';

// eslint-disable-next-line react/jsx-props-no-spreading
const ReportActionItemRow = props => <ReportActionItem {...props} />;

ReportActionItemRow.propTypes = propTypes;
ReportActionItemRow.displayName = 'ReportActionItem';

export default memo(ReportActionItemRow);
