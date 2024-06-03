import type {OnyxKey, UseOnyxResult} from 'react-native-onyx';

function isLoadingOnyxValue(...results: Array<UseOnyxResult<OnyxKey, unknown>[1]>): boolean {
    return results.some((result) => result.status === 'loading');
}

export default isLoadingOnyxValue;
