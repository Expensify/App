import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import AssigneeStep from '@pages/workspace/card/issueNew/AssigneeStep';
import CardNameStep from '@pages/workspace/card/issueNew/CardNameStep';
import CardTypeStep from '@pages/workspace/card/issueNew/CartTypeStep';
import ConfirmationStep from '@pages/workspace/card/issueNew/ConfirmationStep';
import LimitStep from '@pages/workspace/card/issueNew/LimitStep';
import LimitTypeStep from '@pages/workspace/card/issueNew/LimitTypeStep';
import CONST from '@src/CONST';

function IssueNewCardPage() {
    const currentStep = '';
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
