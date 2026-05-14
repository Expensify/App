import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import {getRenamedActionHTML} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import type CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type RenamedActionProps = {
    /** The renamed action data */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RENAMED>;

    /** Whether the report is an expense report */
    isExpenseReport: boolean;
};

function RenamedAction({action, isExpenseReport}: RenamedActionProps) {
    const {translate} = useLocalize();
    const htmlContent = `<comment><muted-text>${getRenamedActionHTML(translate, action, isExpenseReport)}</muted-text></comment>`;

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={htmlContent} />
        </ReportActionItemBasicMessage>
    );
}

export default RenamedAction;
