import type {ReactElement} from 'react';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, Transaction} from '@src/types/onyx';
import type {OriginalMessageAddComment} from '@src/types/onyx/OriginalMessage';
import TextCommentFragment from './comment/TextCommentFragment';
import ReportActionItemFragment from './ReportActionItemFragment';

type ReportActionItemMessageOnyxProps = {
    /** The transaction linked to the report action. */
    transaction: OnyxEntry<Transaction>;
};

type ReportActionItemMessageProps = ReportActionItemMessageOnyxProps & {
    /** The report action */
    action: ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Additional styles to add after local styles. */
    style?: StyleProp<ViewStyle & TextStyle>;

    /** Whether or not the message is hidden by moderation */
    isHidden?: boolean;

    /** The ID of the report */
    reportID: string;
};

function ReportActionItemMessage({action, transaction, displayAsGroup, reportID, style, isHidden = false}: ReportActionItemMessageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const fragments = (action.previousMessage ?? action.message ?? []).filter((item) => !!item);
    const isIOUReport = ReportActionsUtils.isMoneyRequestAction(action);

    if (ReportActionsUtils.isMemberChangeAction(action)) {
        const fragment = ReportActionsUtils.getMemberChangeMessageFragment(action);

        return (
            <View style={[styles.chatItemMessage, style]}>
                <TextCommentFragment
                    fragment={fragment}
                    displayAsGroup={displayAsGroup}
                    style={style}
                    source=""
                    styleAsDeleted={false}
                />
            </View>
        );
    }

    let iouMessage: string | undefined;
    if (isIOUReport) {
        const originalMessage = action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? action.originalMessage : null;
        const iouReportID = originalMessage?.IOUReportID;
        if (iouReportID) {
            iouMessage = ReportUtils.getIOUReportActionDisplayMessage(action, transaction);
        }
    }

    const isApprovedOrSubmittedReportAction = ReportActionsUtils.isApprovedOrSubmittedReportAction(action);

    const isHoldReportAction = [CONST.REPORT.ACTIONS.TYPE.HOLD, CONST.REPORT.ACTIONS.TYPE.UNHOLD].some((type) => type === action.actionName);

    /**
     * Get the ReportActionItemFragments
     * @param shouldWrapInText determines whether the fragments are wrapped in a Text component
     * @returns report action item fragments
     */
    const renderReportActionItemFragments = (shouldWrapInText: boolean): ReactElement | ReactElement[] => {
        const reportActionItemFragments = fragments.map((fragment, index) => (
            <ReportActionItemFragment
                /* eslint-disable-next-line react/no-array-index-key */
                key={`actionFragment-${action.reportActionID}-${index}`}
                fragment={fragment}
                iouMessage={iouMessage}
                isThreadParentMessage={ReportActionsUtils.isThreadParentMessage(action, reportID)}
                pendingAction={action.pendingAction}
                actionName={action.actionName}
                source={(action.originalMessage as OriginalMessageAddComment['originalMessage'])?.source}
                accountID={action.actorAccountID ?? 0}
                style={style}
                displayAsGroup={displayAsGroup}
                isApprovedOrSubmittedReportAction={isApprovedOrSubmittedReportAction}
                isHoldReportAction={isHoldReportAction}
                // Since system messages from Old Dot begin with the person who performed the action,
                // the first fragment will contain the person's display name and their email. We'll use this
                // to decide if the fragment should be from left to right for RTL display names e.g. Arabic for proper
                // formatting.
                isFragmentContainingDisplayName={index === 0}
                moderationDecision={action.message?.[0]?.moderationDecision?.decision}
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

ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default withOnyx<ReportActionItemMessageProps, ReportActionItemMessageOnyxProps>({
    transaction: {
        key: ({action}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${ReportActionsUtils.getLinkedTransactionID(action) ?? 0}`,
    },
})(ReportActionItemMessage);
