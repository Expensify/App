import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getIntegrationSyncFailedMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type IntegrationSyncFailedMessageProps = {
    action: OnyxEntry<OnyxTypes.ReportAction>;
    policyID: string | undefined;
};

function IntegrationSyncFailedMessage({action, policyID}: IntegrationSyncFailedMessageProps) {
    const {translate} = useLocalize();
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment><muted-text>${getIntegrationSyncFailedMessage(translate, action, policyID, isTryNewDotNVPDismissed)}</muted-text></comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default IntegrationSyncFailedMessage;
