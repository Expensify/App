import ONYXKEYS from '@src/ONYXKEYS';
import type DefaultP2PMileageRate from '@src/types/onyx/DefaultP2PMileageRate';

// This module is used to load the default P2P mileage rate for a user based on their personal policy outputCurrency (default / reporting currency).
// Whenever a user starts the "Track distance" flow the getDefaultP2PMileageRate action will fetch the rate and unit from the hard coded mapping stored in Auth
// (CURRENCY_TO_DEFAULT_MILEAGE_RATE), via the API read command GetDefaultP2PMileageRate.
// The rate will be stored in Onyx and loaded into a variable here via Onyx.connectWithoutView. Normally useOnyx should be used instead, but because
// the default P2P mileage rate is used across many library functions an exception is allowed to prevent having to pass the value through many functions
// across the codebase.
// DO NOT use this pattern for other Onyx data unless you get authorization from the internal Expensify team in Slack.
import Onyx from 'react-native-onyx';

let defaultP2PMileageRate: DefaultP2PMileageRate | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.DEFAULT_P2P_MILEAGE_RATE,
    callback: (value) => {
        defaultP2PMileageRate = value;
    },
});

function getStoredDefaultP2PMileageRate() {
    return defaultP2PMileageRate;
}

export default getStoredDefaultP2PMileageRate;
