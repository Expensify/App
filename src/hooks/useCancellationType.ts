import {useOnyx} from 'react-native-onyx';
import type {CancellationType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useCancellationType(): CancellationType | undefined {
    const [cancellationDetails] = useOnyx(ONYXKEYS.NVP_PRIVATE_CANCELLATION_DETAILS);

    if (!cancellationDetails) {
        return;
    }

    if (cancellationDetails.length === 1) {
        return cancellationDetails[0]?.cancellationType;
    }

    const sorted = cancellationDetails?.sort((a, b) => new Date(b?.requestDate ?? 0).getDate() - new Date(a?.requestDate ?? 0).getDate());

    return sorted[0].cancellationType;
}

export default useCancellationType;
