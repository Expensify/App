import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import AssigneeStep from './AssigneeStep';
import CardSelectionStep from './CardSelectionStep';
import ConfirmationStep from './ConfirmationStep';
import TransactionStartDateStep from './TransactionStartDateStep';

type AssignCardFeedPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD> & WithPolicyAndFullscreenLoadingProps;

function AssignCardFeedPage({route, policy}: AssignCardFeedPageProps) {
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const currentStep = assignCard?.currentStep;

    const feed = route.params?.feed;
    const backTo = route.params?.backTo;
    const policyID = policy?.id ?? '-1';

    useEffect(() => {
        CompanyCards.setAssignCardStepAndData({data: {bankName: feed}});
    }, [feed]);

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.ASSIGNEE:
            return <AssigneeStep policy={policy} />;
        case CONST.COMPANY_CARD.STEP.CARD:
            return (
                <CardSelectionStep
                    feed={feed}
                    policyID={policyID}
                />
            );
        case CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE:
            return <TransactionStartDateStep />;
        case CONST.COMPANY_CARD.STEP.CONFIRMATION:
            return (
                <ConfirmationStep
                    policyID={policyID}
                    backTo={backTo}
                />
            );
        default:
            return <AssigneeStep policy={policy} />;
    }

    return <AssigneeStep policy={policy} />;
}

export default withPolicyAndFullscreenLoading(AssignCardFeedPage);
