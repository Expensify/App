import RenderHTML from '@components/RenderHTML';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {openLink} from '@libs/actions/Link';
import {explain} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getParticipantsPersonalDetails} from '@libs/PersonalDetailsUtils';
import {hasReasoning} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

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
    const {environmentURL} = useEnvironment();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const actionHasReasoning = hasReasoning(action);
    const computedMessage = actionHasReasoning ? `${message}${translate('iou.AskToExplain')}` : message;

    const handleLinkPress = (event: GestureResponderEvent | KeyboardEvent, href: string) => {
        // Handle the special "Explain" link
        if (href.endsWith(CONST.CONCIERGE_EXPLAIN_LINK_PATH)) {
            const currentUserAccountID = OnyxUtils.get(ONYXKEYS.SESSION)?.accountID ?? CONST.DEFAULT_NUMBER_ID;
            const personalDetails = OnyxUtils.get(ONYXKEYS.PERSONAL_DETAILS_LIST);
            const participantsPersonalDetails = getParticipantsPersonalDetails([currentUserAccountID, Number(action?.actorAccountID)], personalDetails);
            const introSelected = OnyxUtils.get(ONYXKEYS.NVP_INTRO_SELECTED);
            const isSelfTourViewed = hasSeenTourSelector(OnyxUtils.get(ONYXKEYS.NVP_ONBOARDING));
            const betas = OnyxUtils.get(ONYXKEYS.BETAS);
            const delegateEmail = delegateEmailSelector(OnyxUtils.get(ONYXKEYS.ACCOUNT)).toLowerCase();
            const delegateAccountID = delegateEmail ? Object.values(personalDetails ?? {}).find((detail) => detail?.login?.toLowerCase() === delegateEmail)?.accountID : undefined;
            explain(
                childReport,
                originalReport,
                action,
                translate,
                currentUserAccountID,
                introSelected,
                betas,
                isSelfTourViewed,
                delegateAccountID,
                participantsPersonalDetails,
                personalDetails?.[currentUserAccountID]?.timezone,
            );
            return;
        }

        // For all other links, use the default link handler
        openLink(href, environmentURL);
    };

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML
                html={`<comment><muted-text>${computedMessage}</muted-text></comment>`}
                isSelectable={!canUseTouchScreen() || !shouldUseNarrowLayout}
                onLinkPress={handleLinkPress}
            />
        </ReportActionItemBasicMessage>
    );
}

ReportActionItemMessageWithExplain.displayName = 'ReportActionItemMessageWithExplain';

export default ReportActionItemMessageWithExplain;
