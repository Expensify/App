import {useOnyx} from 'react-native-onyx';
import type {CancellationType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useCancellationType(): CancellationType | undefined {
    const [cancellationDetails] = useOnyx(ONYXKEYS.NVP_PRIVATE_CANCELLATION_DETAILS);

    const filteredCancellationDetails = cancellationDetails?.filter((item) => !item.cancellationDate);

    if (!filteredCancellationDetails) {
        return;
    }

    if (filteredCancellationDetails.length === 1) {
        return filteredCancellationDetails[0]?.cancellationType;
    }

    const sorted = filteredCancellationDetails?.sort((a, b) => new Date(b?.requestDate ?? 0).getDate() - new Date(a?.requestDate ?? 0).getDate());

    return sorted[0]?.cancellationType;
}

export default useCancellationType;
