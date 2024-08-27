import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AssigneeStep from './AssigneeStep';
import CardSelectionStep from './CardSelectionStep';
import ConfirmationStep from './ConfirmationStep';
import TransactionStartDateStep from './TransactionStartDateStep';

function AssignCardFeedPage({policy}: WithPolicyAndFullscreenLoadingProps) {
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const currentStep = assignCard?.currentStep;

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.ASSIGNEE:
            return <AssigneeStep policy={policy} />;
        case CONST.COMPANY_CARD.STEP.CARD:
            return <CardSelectionStep />;
        case CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE:
            return <TransactionStartDateStep />;
        case CONST.COMPANY_CARD.STEP.CONFIRMATION:
            return <ConfirmationStep />;
        default:
            return <AssigneeStep policy={policy} />;
    }

    return <AssigneeStep policy={policy} />;
}

export default withPolicyAndFullscreenLoading(AssignCardFeedPage);
