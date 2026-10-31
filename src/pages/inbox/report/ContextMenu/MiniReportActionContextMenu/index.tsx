import React from 'react';

import type MiniReportActionContextMenuProps from './types';

import MiniReportActionContextMenuContent from './MiniReportActionContextMenuContent';

function MiniReportActionContextMenu(props: MiniReportActionContextMenuProps) {
    return <MiniReportActionContextMenuContent {...props} />;
}

export default MiniReportActionContextMenu;
