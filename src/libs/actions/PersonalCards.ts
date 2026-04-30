import type {NullishDeep} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AddNewPersonalCard, AddNewPersonalCardFeedData, AddNewPersonalCardFeedStep} from '@src/types/onyx/PersonalCard';

type AddNewPersonalCardFlowData = {
    /** Step to be set in Onyx */
    step?: AddNewPersonalCardFeedStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<AddNewPersonalCardFeedData>;
};

function setAddNewPersonalCardStepAndData({data, isEditing, step}: NullishDeep<AddNewPersonalCardFlowData>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- false positive when AddNewPersonalCard includes `errors`; merge fields are NullishDeep<AddNewPersonalCardFlowData>
    Onyx.merge(ONYXKEYS.ADD_NEW_PERSONAL_CARD, {data, isEditing, currentStep: step} as Partial<AddNewPersonalCard>);
}

function clearAddNewPersonalCardFlow() {
    Onyx.set(ONYXKEYS.ADD_NEW_PERSONAL_CARD, {
        currentStep: null,
        data: {},
    });
}

function clearAddNewPersonalCardErrors() {
    Onyx.merge(ONYXKEYS.ADD_NEW_PERSONAL_CARD, {errors: null});
}

export {clearAddNewPersonalCardErrors, clearAddNewPersonalCardFlow, setAddNewPersonalCardStepAndData};
