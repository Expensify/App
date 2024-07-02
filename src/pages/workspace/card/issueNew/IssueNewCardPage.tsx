import React from 'react';
import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AssigneeStep from './AssigneeStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import ConfirmationStep from './ConfirmationStep';
import LimitStep from './LimitStep';
import LimitTypeStep from './LimitTypeStep';

function IssueNewCardPage() {
    const [issueNewCard] = useOnyx(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD);

    const {currentStep} = issueNewCard ?? {};

    switch (currentStep) {
        case CONST.EXPENSIFY_CARD.STEP.ASSIGNEE:
            return <AssigneeStep />;
        case CONST.EXPENSIFY_CARD.STEP.CARD_TYPE:
            return <CardTypeStep />;
        case CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE:
            return <LimitTypeStep />;
        case CONST.EXPENSIFY_CARD.STEP.LIMIT:
            return <LimitStep />;
        case CONST.EXPENSIFY_CARD.STEP.CARD_NAME:
            return <CardNameStep />;
        case CONST.EXPENSIFY_CARD.STEP.CONFIRMATION:
            return <ConfirmationStep />;
        default:
            return <AssigneeStep />;
    }
}

IssueNewCardPage.displayName = 'IssueNewCardPage';
export default IssueNewCardPage;
