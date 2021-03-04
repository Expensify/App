import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function initialiseIOUModal() {
    Onyx.merge(ONYXKEYS.IOU, {
        IOUAmount: {
            isLoading: true
        },
        IOUParticipants: {
            isLoading: true
        },
        IOUConfirm: {
            isLoading: false
        },
    });
}

function setIouStepIsLoading(stepType, isLoading) {
    Onyx.merge(ONYXKEYS.IOU, {[stepType]: {isLoading: isLoading}} );
}

export {
    setIouStepIsLoading,
    initialiseIOUModal,
};
