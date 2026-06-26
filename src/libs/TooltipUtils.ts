import type {DismissedProductTraining} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function isProductTrainingElementDismissed(elementName: keyof DismissedProductTraining, dismissedProductTraining: OnyxEntry<DismissedProductTraining>) {
    return typeof dismissedProductTraining?.[elementName] === 'string' ? !!dismissedProductTraining?.[elementName] : !!dismissedProductTraining?.[elementName]?.timestamp;
}

export default isProductTrainingElementDismissed;
