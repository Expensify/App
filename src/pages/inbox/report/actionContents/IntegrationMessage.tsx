import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getMessageOfOldDotReportAction} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

type IntegrationMessageProps = {
    /** Integration report action to render. */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE>;

    /** ID of policy that owns report action. */
    policyID: string | undefined;
};

function IntegrationMessage({action, policyID}: IntegrationMessageProps) {
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`);
    const message = getMessageOfOldDotReportAction(translate, action, true, policy);

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment><muted-text>${message}</muted-text></comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default IntegrationMessage;
