import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import usePermissions from '@hooks/usePermissions';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import AmexCustomFeed from './AmexCustomFeed';
import CardInstructionsStep from './CardInstructionsStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import DetailsStep from './DetailsStep';
import SelectBankStep from './SelectBankStep';
import SelectFeedType from './SelectFeedType';

type AddNewCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW>;

function AddNewCardPage({route}: AddNewCardPageProps) {
    const {policyID} = route.params;
    const [addNewCardFeed] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const {canUseDirectFeeds} = usePermissions();

    const {currentStep} = addNewCardFeed ?? {};

    if (canUseDirectFeeds) {
        switch (currentStep) {
            case CONST.COMPANY_CARDS.STEP.SELECT_BANK:
                return <SelectBankStep />;
            case CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE:
                return <SelectFeedType />;
            case CONST.COMPANY_CARDS.STEP.CARD_TYPE:
                return <CardTypeStep />;
            case CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS:
                return <CardInstructionsStep policyID={policyID} />;
            case CONST.COMPANY_CARDS.STEP.CARD_NAME:
                return <CardNameStep />;
            case CONST.COMPANY_CARDS.STEP.CARD_DETAILS:
                return <DetailsStep />;
            case CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED:
                return <AmexCustomFeed />;
            default:
                return <SelectBankStep />;
        }
    } else {
        switch (currentStep) {
            case CONST.COMPANY_CARDS.STEP.CARD_TYPE:
                return <CardTypeStep />;
            case CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS:
                return <CardInstructionsStep policyID={policyID} />;
            case CONST.COMPANY_CARDS.STEP.CARD_NAME:
                return <CardNameStep />;
            case CONST.COMPANY_CARDS.STEP.CARD_DETAILS:
                return <DetailsStep />;
            default:
                return <CardTypeStep />;
        }
    }
}

AddNewCardPage.displayName = 'AddNewCardPage';
export default withPolicyAndFullscreenLoading(AddNewCardPage);
