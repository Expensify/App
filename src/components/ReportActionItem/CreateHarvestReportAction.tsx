import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getHarvestCreatedExpenseReportMessage} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ONYXKEYS from '@src/ONYXKEYS';

type CreateHarvestReportActionProps = {
    /** The original ID of the report */
    reportNameValuePairsOriginalID: string | undefined;
};

function CreateHarvestReportAction({reportNameValuePairsOriginalID}: CreateHarvestReportActionProps) {
    const {translate} = useLocalize();
    const [harvestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportNameValuePairsOriginalID}`);
    const harvestReportName = getReportName(harvestReport);
    const htmlContent = `<comment><muted-text>${getHarvestCreatedExpenseReportMessage(harvestReport?.reportID, harvestReportName, translate)}</muted-text></comment>`;

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={htmlContent} />
        </ReportActionItemBasicMessage>
    );
}

export default CreateHarvestReportAction;
