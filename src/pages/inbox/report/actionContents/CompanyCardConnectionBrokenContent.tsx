/**
 * Shows the broken company card connection messages with the feed name the company cards page uses.
 */
import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getCompanyCardConnectionBroken30DaysMessage, getCompanyCardConnectionBrokenMessage, getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {companyCardNicknamesSelector} from '@selectors/Card';
import React from 'react';

type CompanyCardConnectionBrokenContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN | typeof CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN_30_DAYS>;
};

function CompanyCardConnectionBrokenContent({action}: CompanyCardConnectionBrokenContentProps) {
    const {translate} = useLocalize();

    const originalMessage = getOriginalMessage(action);
    const [companyCardNicknames] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${originalMessage?.fundID}`, {selector: companyCardNicknamesSelector});
    const customFeedName = originalMessage?.bank ? companyCardNicknames?.[originalMessage.bank] : undefined;

    const message =
        action.actionName === CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN_30_DAYS
            ? getCompanyCardConnectionBroken30DaysMessage(translate, action, customFeedName)
            : getCompanyCardConnectionBrokenMessage(translate, action, customFeedName);

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment><muted-text>${message}</muted-text></comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default CompanyCardConnectionBrokenContent;
