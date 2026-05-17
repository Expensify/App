import React from 'react';
import ComposerProvider from './ComposerProvider';
import ReportActionComposeLayout from './ReportActionComposeLayout';
import type {ReportActionComposeWithChildrenProps} from './ReportActionComposeTypes';

function ReportActionComposeWithProvider({reportID, children}: ReportActionComposeWithChildrenProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ReportActionComposeLayout reportID={reportID}>{children}</ReportActionComposeLayout>
        </ComposerProvider>
    );
}

export default ReportActionComposeWithProvider;
