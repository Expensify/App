import React, {useCallback} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {explain} from '@libs/actions/Report';
import {hasReasoning} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import ReportActionItemBasicMessage from './ReportActionItemBasicMessage';

type ReportActionItemMessageWithExplainProps = {
    /** The message to display */
    message: string;

    /** All the data of the action item */
    action: OnyxEntry<ReportAction>;

    /** The report ID of linked report */
    reportID: string | undefined;
};

/**
 * Wrapper component that renders a message and automatically appends the "Explain" link
 * if the action has reasoning.
 */
function ReportActionItemMessageWithExplain({message, action, reportID}: ReportActionItemMessageWithExplainProps) {
    const {translate} = useLocalize();
    const personalDetail = useCurrentUserPersonalDetails();

    const actionHasReasoning = hasReasoning(action);
    const computedMessage = actionHasReasoning ? `${message}${translate('iou.AskToExplain')}` : message;

    const handleExplainLinkPress = useCallback(
        (event: GestureResponderEvent | KeyboardEvent, href: string) => {
            if (!href.endsWith(CONST.CONCIERGE_EXPLAIN_LINK_PATH)) {
                return;
            }

            const actionOriginalReportID = getOriginalReportID(reportID, action);
            explain(action, actionOriginalReportID, translate, personalDetail.accountID, personalDetail?.timezone);
        },
        [action, reportID, translate, personalDetail?.timezone, personalDetail.accountID],
    );

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML
                html={`<comment><muted-text>${computedMessage}</muted-text></comment>`}
                isSelectable={false}
                onLinkPress={handleExplainLinkPress}
            />
        </ReportActionItemBasicMessage>
    );
}

ReportActionItemMessageWithExplain.displayName = 'ReportActionItemMessageWithExplain';

export default ReportActionItemMessageWithExplain;
