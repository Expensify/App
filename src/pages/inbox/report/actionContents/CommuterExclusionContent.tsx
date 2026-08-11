import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';

import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getCommuterExclusionMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type CommuterExclusionContentProps = {
    /** The commuter exclusion action */
    action: OnyxEntry<OnyxTypes.ReportAction>;

    /** The policy the report belongs to */
    policyID: string | undefined;
};

function CommuterExclusionContent({action, policyID}: CommuterExclusionContentProps) {
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    // Only admins can open the workspace distance settings, so members see plain text instead of a link.
    const settingsLinkPolicyID = isPolicyAdmin(policy) ? policyID : undefined;

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={`<comment><muted-text>${getCommuterExclusionMessage(translate, action, settingsLinkPolicyID)}</muted-text></comment>`} />
        </ReportActionItemBasicMessage>
    );
}

CommuterExclusionContent.displayName = 'CommuterExclusionContent';

export default CommuterExclusionContent;
