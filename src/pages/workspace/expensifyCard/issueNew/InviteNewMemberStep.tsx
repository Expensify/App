import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import InviteNewMemberStepComponent from '@components/InviteNewMemberStepComponent';
import useLocalize from '@hooks/useLocalize';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type InviteeNewMemberStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function InviteNewMemberStep({policy}: InviteeNewMemberStepProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});

    const isEditing = issueNewCard?.isEditing;
    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }

        setIssueNewCardStepAndData({
            step: CONST.EXPENSIFY_CARD.STEP.ASSIGNEE,
            data: {...issueNewCard?.data, assigneeAccountID: undefined, assigneeEmail: undefined},
            isEditing: false,
            policyID,
        });
    };

    const goToNextStep = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
        } else {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE, isEditing: false, policyID});
        }
    };

    return (
        <InviteNewMemberStepComponent
            title={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            stepNames={[...CONST.EXPENSIFY_CARD.STEP_NAMES]}
            assigneeEmail={issueNewCard?.data?.assigneeEmail}
            assigneeAccountID={issueNewCard?.data?.assigneeAccountID}
            policy={policy}
            goToNextStep={goToNextStep}
        />
    );
}

InviteNewMemberStep.displayName = 'InviteNewMemberStep';

export default InviteNewMemberStep;
