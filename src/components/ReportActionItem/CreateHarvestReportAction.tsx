import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getHarvestCreatedExpenseReportMessage} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ONYXKEYS from '@src/ONYXKEYS';

type CreateHarvestReportActionProps = {
    /** ID of the chat report the harvest "Created" action belongs to */
    reportID: string | undefined;
};

function CreateHarvestReportAction({reportID}: CreateHarvestReportActionProps) {
    const {translate} = useLocalize();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const [harvestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportNameValuePairs?.originalID}`);
    const harvestReportName = getReportName(harvestReport);
    const htmlContent = `<comment><muted-text>${getHarvestCreatedExpenseReportMessage(reportNameValuePairs?.originalID, harvestReportName, translate)}</muted-text></comment>`;

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={htmlContent} />
        </ReportActionItemBasicMessage>
    );
}

export default CreateHarvestReportAction;
