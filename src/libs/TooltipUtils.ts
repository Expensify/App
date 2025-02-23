import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DismissedProductTraining} from '@src/types/onyx';

let nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>;
Onyx.connect({
    key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
    callback: (value) => (nvpDismissedProductTraining = value),
});

function isProductTrainingElementDismissed(elementName: keyof DismissedProductTraining, dismissedProductTraining: OnyxEntry<DismissedProductTraining> = nvpDismissedProductTraining) {
    return typeof dismissedProductTraining?.[elementName] === 'string' ? !!dismissedProductTraining?.[elementName] : !!dismissedProductTraining?.[elementName]?.dismissedTime;
}

export {isProductTrainingElementDismissed};
