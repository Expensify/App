import React from 'react';
import Button from '@components/Button';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getNextApproverAccountID, isReportOwner} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useConfirmApproval from './useConfirmApproval';

type ApprovePrimaryActionProps = {
    reportID: string | undefined;
};

function ApprovePrimaryAction({reportID}: ApprovePrimaryActionProps) {
    const {startApprovedAnimation} = usePaymentAnimationsContext();
    const {translate} = useLocalize();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);

    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover =
        isReportOwner(moneyRequestReport) && (nextApproverAccountID === moneyRequestReport?.ownerAccountID || moneyRequestReport?.managerID === moneyRequestReport?.ownerAccountID);
    const isBlockSubmitDueToPreventSelfApproval = isSubmitterSameAsNextApprover && policy?.preventSelfApproval;

    const confirmApproval = useConfirmApproval(reportID, startApprovedAnimation);

    return (
        <Button
            success
            onPress={confirmApproval}
            text={translate('iou.approve')}
            isDisabled={isBlockSubmitDueToPreventSelfApproval}
        />
    );
}

export default ApprovePrimaryAction;
