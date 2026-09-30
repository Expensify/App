import type ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

type SearchPayOnyxKey = typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE | typeof ONYXKEYS.COLLECTION.SNAPSHOT | typeof ONYXKEYS.COLLECTION.REPORT;

type AdditionalPayOnyxData = {
    optimisticData?: Array<OnyxUpdate<SearchPayOnyxKey>>;
    successData?: Array<OnyxUpdate<SearchPayOnyxKey>>;
    failureData?: Array<OnyxUpdate<SearchPayOnyxKey>>;
};

export default AdditionalPayOnyxData;
