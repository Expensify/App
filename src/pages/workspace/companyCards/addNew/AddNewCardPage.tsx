import React from 'react';
import {useOnyx} from 'react-native-onyx';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import CardInstructionsStep from './CardInstructionsStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import DetailsStep from './DetailsStep';

type AssignCardFeedPageProps = WithPolicyAndFullscreenLoadingProps;

function AddNewCardPage({policy}: AssignCardFeedPageProps) {
    const [addNewCardFeed] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);

    const {currentStep} = addNewCardFeed ?? {};

    switch (currentStep) {
        case CONST.COMPANY_CARDS.STEP.CARD_TYPE:
            return <CardTypeStep />;
        case CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS:
            return <CardInstructionsStep />;
        case CONST.COMPANY_CARDS.STEP.CARD_NAME:
            return <CardNameStep />;
        case CONST.COMPANY_CARDS.STEP.CARD_DETAILS:
            return <DetailsStep policyID={policy?.id ?? '-1'} />;
        default:
            return <CardTypeStep />;
    }
}

AddNewCardPage.displayName = 'AddNewCardPage';
export default withPolicyAndFullscreenLoading(AddNewCardPage);
