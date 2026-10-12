import type AdditionalPayOnyxData from './types/AdditionalPayOnyxData';

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
