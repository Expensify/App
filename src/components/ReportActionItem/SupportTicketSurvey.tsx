import type {Emoji} from '@assets/emojis/types';

import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {findEmojiByName} from '@libs/EmojiUtils';
import {getReportActionHtml} from '@libs/ReportActionsUtils';

import {addEmojiReaction} from '@userActions/EmojiReactions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type SupportTicketSurveyProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY>;
    report: OnyxEntry<Report>;
    reportID: string | undefined;
};

function getLatestSurveyAfterResolution(reportActions: OnyxEntry<ReportActions>): ReportAction | undefined {
    const actions = Object.values(reportActions ?? {}).filter((reportAction): reportAction is ReportAction => !!reportAction);
    const latestResolvedAction = actions
        .filter((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED)
        .sort((firstAction, secondAction) => firstAction.created.localeCompare(secondAction.created))
        .at(-1);

    if (!latestResolvedAction) {
        return undefined;
    }

    return actions
        .filter((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && reportAction.created >= latestResolvedAction.created)
        .sort((firstAction, secondAction) => firstAction.created.localeCompare(secondAction.created))
        .at(-1);
}

function SupportTicketSurvey({action, report, reportID}: SupportTicketSurveyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const latestSurvey = useMemo(() => getLatestSurveyAfterResolution(reportActions), [reportActions]);
    const canRateSurvey = report?.ownerAccountID === currentUserAccountID;

    if (
        report?.stateNum !== CONST.REPORT.STATE_NUM.APPROVED ||
        report?.statusNum !== CONST.REPORT.STATUS_NUM.CLOSED ||
        reportNameValuePairs?.reopenedAsReportID ||
        latestSurvey?.reportActionID !== action.reportActionID ||
        !reportID
    ) {
        return null;
    }

    const react = (emoji: Emoji) => addEmojiReaction(reportID, action.reportActionID, emoji, CONST.EMOJI_DEFAULT_SKIN_TONE, currentUserAccountID);

    return (
        <View style={styles.chatItemMessage}>
            <RenderHTML html={getReportActionHtml(action)} />
            {canRateSurvey && (
                <View style={[styles.flexRow, styles.gap2, styles.mt2]}>
                    <Button
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={() => react(findEmojiByName('+1'))}
                        accessibilityLabel={translate('concierge.feedback.useful')}
                    >
                        <Button.Text>👍</Button.Text>
                    </Button>
                    <Button
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={() => react(findEmojiByName('-1'))}
                        accessibilityLabel={translate('concierge.feedback.notUseful')}
                    >
                        <Button.Text>👎</Button.Text>
                    </Button>
                </View>
            )}
        </View>
    );
}

export default SupportTicketSurvey;
export {getLatestSurveyAfterResolution};
