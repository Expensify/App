import React from 'react';
import ComposerInputArea from './ComposerInputArea';
import ComposerLayout from './ComposerLayout';
import ComposerProvider from './ComposerProvider';
import type {ReportActionComposeProps} from './types';

function EditOnlyReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ComposerLayout reportID={reportID}>
                <ComposerInputArea reportID={reportID} />
            </ComposerLayout>
        </ComposerProvider>
    );
}

export default EditOnlyReportActionCompose;
