import React from 'react';
import ReportActionComposeInputArea from './ReportActionComposeInputArea';
import type {ReportActionComposeProps} from './ReportActionComposeTypes';
import ReportActionComposeWithProvider from './ReportActionComposeWithProvider';

function EditOnlyReportActionComposer({reportID}: ReportActionComposeProps) {
    return (
        <ReportActionComposeWithProvider reportID={reportID}>
            <ReportActionComposeInputArea reportID={reportID} />
        </ReportActionComposeWithProvider>
    );
}

export default EditOnlyReportActionComposer;
