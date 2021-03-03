import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Persists IOU participants from current report, allowing the user to skip the participant selection step.
 */
function setIOUParticipants() {
    // todo
}

function setIouStepIsLoading(isLoading) {
    Onyx.merge(ONYXKEYS.IOU, {'currencyIsLoading': isLoading});
}

export {
    setIOUParticipants,
    setIouStepIsLoading,
};
