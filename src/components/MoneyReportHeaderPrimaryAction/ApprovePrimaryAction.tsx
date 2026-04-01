import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSubmitAndClose} from '@libs/PolicyUtils';
import {getNextApproverAccountID, isReportOwner} from '@libs/ReportUtils';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import useConfirmApproval from './useConfirmApproval';

type ApprovePrimaryActionProps = {
    reportID: string | undefined;
    startApprovedAnimation: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType) => void;
};

function ApprovePrimaryAction({reportID, startApprovedAnimation, onHoldMenuOpen}: ApprovePrimaryActionProps) {
    const {translate} = useLocalize();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const shouldUseMarkAsDoneCopy = isTrackIntentUser && isSubmitAndClose(policy);
    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover =
        isReportOwner(moneyRequestReport) && (nextApproverAccountID === moneyRequestReport?.ownerAccountID || moneyRequestReport?.managerID === moneyRequestReport?.ownerAccountID);
    const isBlockSubmitDueToPreventSelfApproval = isSubmitterSameAsNextApprover && policy?.preventSelfApproval;

    const confirmApproval = useConfirmApproval(reportID, startApprovedAnimation, onHoldMenuOpen);

    return (
        <Button
            success
            onPress={confirmApproval}
            text={shouldUseMarkAsDoneCopy ? translate('common.markAsDone') : translate('iou.approve')}
            isDisabled={isBlockSubmitDueToPreventSelfApproval}
        />
    );
}

export default ApprovePrimaryAction;
