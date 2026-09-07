import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';

import {getMessageOfOldDotReportAction} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import type CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type IntegrationMessageProps = {
    /** Integration report action to render. */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE>;
};

function IntegrationMessage({action}: IntegrationMessageProps) {
    const {translate} = useLocalize();
    const message = getMessageOfOldDotReportAction(translate, action);

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment><muted-text>${message}</muted-text></comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default IntegrationMessage;
