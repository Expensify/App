import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import {openLink} from '@libs/actions/Link';
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
    const {environmentURL} = useEnvironment();

    const actionHasReasoning = hasReasoning(action);
    const computedMessage = actionHasReasoning ? `${message}${translate('iou.AskToExplain')}` : message;

    const handleLinkPress = (event: GestureResponderEvent | KeyboardEvent, href: string) => {
        // Handle the special "Explain" link
        if (href.endsWith(CONST.CONCIERGE_EXPLAIN_LINK_PATH)) {
            explain(childReport, originalReport, action, translate, personalDetail.accountID, personalDetail?.timezone);
            return;
        }

        // For all other links, use the default link handler
        openLink(href, environmentURL);
    };

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML
                html={`<comment><muted-text>${computedMessage}</muted-text></comment>`}
                isSelectable={false}
                onLinkPress={handleLinkPress}
            />
        </ReportActionItemBasicMessage>
    );
}

ReportActionItemMessageWithExplain.displayName = 'ReportActionItemMessageWithExplain';

export default ReportActionItemMessageWithExplain;
