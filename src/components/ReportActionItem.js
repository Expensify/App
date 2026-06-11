import React from 'react';
import ReportActionContextMenu from './ReportActionContextMenu';

const ReportActionItem = ({ report, reportAction, isConciergeChatReport }) => {
  // ... (other code)

  return (
    // ... (other JSX)
    <ReportActionContextMenu
      // ... (other props)
      isConciergeChatReport={isConciergeChatReport}
      report={report}
      reportAction={reportAction}
    />
    // ... (other JSX)
  );
};

export default ReportActionItem;