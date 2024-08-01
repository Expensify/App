import type {ResultMetadata} from 'react-native-onyx';

function isLoadingOnyxValue(...results: ResultMetadata[]): boolean {
    return results.some((result) => result.status === 'loading');
}

export default isLoadingOnyxValue;
