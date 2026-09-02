import type ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

type SearchPayOnyxKey = typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE | typeof ONYXKEYS.COLLECTION.SNAPSHOT | typeof ONYXKEYS.COLLECTION.REPORT;

type AdditionalPayOnyxData = {
    optimisticData?: Array<OnyxUpdate<SearchPayOnyxKey>>;
    successData?: Array<OnyxUpdate<SearchPayOnyxKey>>;
    failureData?: Array<OnyxUpdate<SearchPayOnyxKey>>;
};

function mergeAdditionalPayOnyxData<
    T extends {
        optimisticData?: readonly unknown[];
        successData?: readonly unknown[];
        failureData?: readonly unknown[];
    },
>(onyxData: T, additionalOnyxData?: AdditionalPayOnyxData): T {
    if (!additionalOnyxData) {
        return onyxData;
    }

    return {
        ...onyxData,
        optimisticData: [...(onyxData.optimisticData ?? []), ...(additionalOnyxData.optimisticData ?? [])],
        successData: [...(onyxData.successData ?? []), ...(additionalOnyxData.successData ?? [])],
        failureData: [...(onyxData.failureData ?? []), ...(additionalOnyxData.failureData ?? [])],
    };
}

export default mergeAdditionalPayOnyxData;
export type {AdditionalPayOnyxData, SearchPayOnyxKey};
