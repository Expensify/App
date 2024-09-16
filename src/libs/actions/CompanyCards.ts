import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AssignCard} from '@src/types/onyx/AssignCard';
import type {AddNewCardFeedData, AddNewCardFeedStep} from '@src/types/onyx/CardFeeds';

type AddNewCompanyCardFlowData = {
    /** Step to be set in Onyx */
    step?: AddNewCardFeedStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<AddNewCardFeedData>;
};

function setAssignCardStepAndData({data, isEditing, currentStep}: Partial<AssignCard>) {
    Onyx.merge(ONYXKEYS.ASSIGN_CARD, {data, isEditing, currentStep});
}

function clearAssignCardStepAndData() {
    Onyx.set(ONYXKEYS.ASSIGN_CARD, {});
}

function setAddNewCompanyCardStepAndData({data, isEditing, step}: AddNewCompanyCardFlowData) {
    Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {data, isEditing, currentStep: step});
}

function clearAddNewCardFlow() {
    Onyx.set(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
        currentStep: null,
        data: {},
    });
}

export {setAddNewCompanyCardStepAndData, clearAddNewCardFlow, setAssignCardStepAndData, clearAssignCardStepAndData};
