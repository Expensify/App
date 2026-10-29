import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getIntegrationSyncFailedMessage, hasReasoning} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type IntegrationSyncFailedMessageProps = {
    action: OnyxEntry<OnyxTypes.ReportAction>;
    policyID: string | undefined;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<OnyxTypes.Report>;
};

function IntegrationSyncFailedMessage({action, policyID, originalReport}: IntegrationSyncFailedMessageProps) {
    const {translate} = useLocalize();
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action?.childReportID)}`);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;
    const message = getIntegrationSyncFailedMessage(translate, action, policyID, isTryNewDotNVPDismissed);

    if (hasReasoning(action)) {
        // `AskToExplain` already supplies its own leading period; strip the trailing period
        // from the sync-failure message so the rendered string reads "…settings. Explain" not "…settings.. Explain".
        return (
            <ReportActionItemMessageWithExplain
                message={message.replace(/\.\s*$/, '')}
                action={action}
                childReport={childReport}
                originalReport={originalReport}
            />
        );
    }

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment><muted-text>${message}</muted-text></comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default IntegrationSyncFailedMessage;
