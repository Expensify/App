import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';

type ParticipantSelectorFooterProps = {
    /** The type of IOU report — used to exclude the referral banner on invoice flows */
    iouType: IOUType;

    /** Whether the action is categorize or share — hides the referral CTA and swaps the button label */
    isCategorizeOrShareAction: boolean;

    /** Number of selected options — drives which button renders and whether the footer is shown */
    selectedOptionsLength: number;

    /** Whether the split-bill error should be displayed and the Next button disabled */
    shouldShowSplitBillErrorMessage: boolean;

    /** Whether the list is showing its empty state — suppresses the referral banner */
    shouldShowListEmptyContent: boolean;

    /** Whether the referral banner has been dismissed — controls banner visibility and is used by the parent to gate rendering */
    isDismissedReferralBanner: boolean;

    /** Confirm-selection handler from the parent */
    onConfirmSelection: (keyEvent?: GestureResponderEvent | KeyboardEvent) => void;

    /** Callback to advance the flow when creating a new workspace (categorize/share) */
    onNewWorkspace: () => void;
};

function ParticipantSelectorFooter({
    iouType,
    isCategorizeOrShareAction,
    selectedOptionsLength,
    shouldShowSplitBillErrorMessage,
    shouldShowListEmptyContent,
    isDismissedReferralBanner,
    onConfirmSelection,
    onNewWorkspace,
}: ParticipantSelectorFooterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const shouldShowReferralBanner = !isDismissedReferralBanner && iouType !== CONST.IOU.TYPE.INVOICE && !shouldShowListEmptyContent;

    return (
        <>
            {shouldShowReferralBanner && !isCategorizeOrShareAction && (
                <ReferralProgramCTA
                    referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE}
                    style={[styles.flexShrink0, !!selectedOptionsLength && !shouldShowSplitBillErrorMessage && styles.mb5]}
                />
            )}

            {shouldShowSplitBillErrorMessage && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={translate('iou.error.splitExpenseMultipleParticipantsErrorMessage')}
                />
            )}

            {!!selectedOptionsLength && !isCategorizeOrShareAction && (
                <Button
                    success
                    text={translate('common.next')}
                    onPress={onConfirmSelection}
                    pressOnEnter
                    large
                    isDisabled={shouldShowSplitBillErrorMessage}
                    sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.PARTICIPANTS_NEXT_BUTTON}
                />
            )}
            {isCategorizeOrShareAction && (
                <Button
                    success
                    text={translate('workspace.new.newWorkspace')}
                    onPress={onNewWorkspace}
                    pressOnEnter
                    large
                    sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.PARTICIPANTS_NEW_WORKSPACE_BUTTON}
                />
            )}
        </>
    );
}

export default ParticipantSelectorFooter;
