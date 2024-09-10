import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AssignCard} from '@src/types/onyx/AssignCard';

function setAssignCardStepAndData({data, isEditing, currentStep}: Partial<AssignCard>) {
    Onyx.merge(ONYXKEYS.ASSIGN_CARD, {data, isEditing, currentStep});
}

function clearAssignCardStepAndData() {
    Onyx.set(ONYXKEYS.ASSIGN_CARD, {});
}

export {setAssignCardStepAndData, clearAssignCardStepAndData};
