import React, {useCallback} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {explain} from '@libs/actions/Report';
import {hasReasoning} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import ReportActionItemBasicMessage from './ReportActionItemBasicMessage';

type ReportActionItemMessageWithExplainProps = {
    /** The message to display */
    message: string;

    /** All the data of the action item */
    action: OnyxEntry<ReportAction>;

    /** The child report of the action item */
    childReport: OnyxEntry<Report>;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<Report>;
};

/**
 * Wrapper component that renders a message and automatically appends the "Explain" link
 * if the action has reasoning.
 */
function ReportActionItemMessageWithExplain({message, action, childReport, originalReport}: ReportActionItemMessageWithExplainProps) {
    const {translate} = useLocalize();
    const personalDetail = useCurrentUserPersonalDetails();

    const actionHasReasoning = hasReasoning(action);
    const computedMessage = actionHasReasoning ? `${message}${translate('iou.AskToExplain')}` : message;

    const handleExplainLinkPress = useCallback(
        (event: GestureResponderEvent | KeyboardEvent, href: string) => {
            if (!href.endsWith(CONST.CONCIERGE_EXPLAIN_LINK_PATH)) {
                return;
            }

            explain(childReport, originalReport, action, translate, personalDetail.accountID, personalDetail?.timezone);
        },
        [childReport, originalReport, action, translate, personalDetail?.timezone, personalDetail.accountID],
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
