/**
 * Concierge comment in #admins warning that Auto Pay can't preview cross-border rates and fees once Global Reimbursements is on.
 */
import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import {getAutoPayFeeDisclosureMessage, getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import type CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';

type AutoPayFeeDisclosureContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.AUTO_PAY_FEE_DISCLOSURE>;
};

function AutoPayFeeDisclosureContent({action}: AutoPayFeeDisclosureContentProps) {
    const {translate} = useLocalize();
    const [adminDetails] = usePersonalDetail(getOriginalMessage(action)?.accountID);

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={`<comment>${getAutoPayFeeDisclosureMessage(translate, action, adminDetails)}</comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default AutoPayFeeDisclosureContent;
