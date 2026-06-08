import type {ReactElement} from 'react';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    getOriginalMessage,
    getReportActionMessage,
    getReportActionMessageFragments,
    isAddCommentAction,
    isApprovedOrSubmittedReportAction as isApprovedOrSubmittedReportActionUtils,
    isThreadParentMessage,
} from '@libs/ReportActionsUtils';
import ReportActionItemFragment from '@pages/inbox/report/ReportActionItemFragment';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type ReportActionMessageContentProps = {
    /** The report action */
    action: ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Additional styles to add after local styles. */
    style?: StyleProp<ViewStyle & TextStyle>;

    /** Whether or not the message is hidden by moderation */
    isHidden?: boolean;

    /** The ID of the report */
    reportID: string | undefined;

    /** Optional IOU display message passed into each fragment */
    iouMessage?: string;
};

function ReportActionMessageContent({action, displayAsGroup, reportID, style, isHidden = false, iouMessage}: ReportActionMessageContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isApprovedOrSubmittedReportAction = isApprovedOrSubmittedReportActionUtils(action);
    const isHoldReportAction = [CONST.REPORT.ACTIONS.TYPE.HOLD, CONST.REPORT.ACTIONS.TYPE.UNHOLD].some((type) => type === action.actionName);
    const fragments = getReportActionMessageFragments(translate, action);

    const renderReportActionItemFragments = (shouldWrapInText: boolean): ReactElement | ReactElement[] => {
        const reportActionItemFragments = fragments.map((fragment, index) => (
            <ReportActionItemFragment
                // Message fragments don't have stable unique IDs, so index is the best available key
                /* eslint-disable-next-line react/no-array-index-key */
                key={`actionFragment-${action.reportActionID}-${index}`}
                reportActionID={action.reportActionID}
                fragment={fragment}
                iouMessage={iouMessage}
                isThreadParentMessage={isThreadParentMessage(action, reportID)}
                pendingAction={action.pendingAction}
                actionName={action.actionName}
                source={isAddCommentAction(action) ? getOriginalMessage(action)?.source : ''}
                accountID={action.actorAccountID ?? CONST.DEFAULT_NUMBER_ID}
                style={style}
                displayAsGroup={displayAsGroup}
                isApprovedOrSubmittedReportAction={isApprovedOrSubmittedReportAction}
                isHoldReportAction={isHoldReportAction}
                // Since system messages from Old Dot begin with the person who performed the action,
                // the first fragment will contain the person's display name and their email. We'll use this
                // to decide if the fragment should be from left to right for RTL display names e.g. Arabic for proper
                // formatting.
                isFragmentContainingDisplayName={index === 0}
                moderationDecision={getReportActionMessage(action)?.moderationDecision?.decision}
            />
        ));

        // Approving or submitting reports in oldDot results in system messages made up of multiple fragments of `TEXT` type
        // which we need to wrap in `<Text>` to prevent them rendering on separate lines.
        return shouldWrapInText ? <Text style={styles.ltr}>{reportActionItemFragments}</Text> : reportActionItemFragments;
    };

    return (
        <View style={[styles.chatItemMessage, style]}>
            {!isHidden ? (
                renderReportActionItemFragments(isApprovedOrSubmittedReportAction)
            ) : (
                <Text style={[styles.textLabelSupporting, styles.lh20]}>{translate('moderation.flaggedContent')}</Text>
            )}
        </View>
    );
}

export default ReportActionMessageContent;
