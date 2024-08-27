import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AddNewCardFeedData, AddNewCardFeedStep} from '@src/types/onyx/CardFeeds';

type AddNewCompanyCardFlowData = {
    /** Step to be set in Onyx */
    step?: AddNewCardFeedStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<AddNewCardFeedData>;
};

function setAddNewCompanyCardStepAndData({data, isEditing, step}: AddNewCompanyCardFlowData) {
    Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {data, isEditing, currentStep: step});
}

// eslint-disable-next-line import/prefer-default-export
export {setAddNewCompanyCardStepAndData};
