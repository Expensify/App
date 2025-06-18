import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import InviteNewMemberStepComponent from '@components/InviteNewMemberStepComponent';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import {getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';

type InviteNewMemberStepProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    feed: OnyxTypes.CompanyCardFeed;
};

function InviteNewMemberStep({policy, feed}: InviteNewMemberStepProps) {
    const {translate} = useLocalize();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});

    const [list] = useCardsList(policy?.id, feed);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.settings?.oAuthAccountDetails?.[feed]);

    const isEditing = assignCard?.isEditing;

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION, isEditing: false});
        } else {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                data: {
                    ...assignCard?.data,
                    assigneeAccountID: undefined,
                    email: undefined,
                },
                isEditing: false,
            });
        }
    };

    const goToNextStep = () => {
        let nextStep: AssignCardStep = CONST.COMPANY_CARD.STEP.CARD;
        const data: Partial<AssignCardData> = {
            email: assignCard?.data?.email,
            cardName: getDefaultCardName(assignCard?.data?.email),
        };

        if (hasOnlyOneCardToAssign(filteredCardList)) {
            nextStep = CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
            data.cardNumber = Object.keys(filteredCardList).at(0);
            data.encryptedCardNumber = Object.values(filteredCardList).at(0);
        }

        setAssignCardStepAndData({
            currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
            data,
            isEditing: false,
        });
    };

    return (
        <InviteNewMemberStepComponent
            title={translate('workspace.companyCards.assignCard')}
            handleBackButtonPress={handleBackButtonPress}
            stepNames={[...CONST.COMPANY_CARD.STEP_NAMES]}
            assigneeEmail={assignCard?.data?.email}
            assigneeAccountID={assignCard?.data?.assigneeAccountID}
            policy={policy}
            goToNextStep={goToNextStep}
        />
    );
}

InviteNewMemberStep.displayName = 'InviteNewMemberStep';

export default InviteNewMemberStep;
