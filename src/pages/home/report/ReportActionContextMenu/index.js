import React from 'react';
import {propTypes, defaultProps} from './ReportActionContextMenuPropTypes';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';

// eslint-disable-next-line react/jsx-props-no-spreading
const ReportActionContextMenu = props => <BaseReportActionContextMenu {...props} />;

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;
ReportActionContextMenu.displayName = 'ReportActionContextMenu';

export default ReportActionContextMenu;
