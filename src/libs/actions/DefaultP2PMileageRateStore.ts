import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type DefaultP2PMileageRate from '@src/types/onyx/DefaultP2PMileageRate';

let storedDefaultP2PMileageRate: DefaultP2PMileageRate | undefined;
Onyx.connect({
    key: ONYXKEYS.DEFAULT_P2P_MILEAGE_RATE,
    callback: (value) => {
        storedDefaultP2PMileageRate = value ?? undefined;
    },
});

function getStoredDefaultP2PMileageRate(): DefaultP2PMileageRate | undefined {
    return storedDefaultP2PMileageRate;
}

export default getStoredDefaultP2PMileageRate;
