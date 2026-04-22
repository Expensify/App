import type {OnyxEntry} from 'react-native-onyx';
import type {Network} from '@src/types/onyx';

const shouldFailAllRequestsSelector = (network: OnyxEntry<Network>) => !!network?.shouldFailAllRequests;

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {shouldFailAllRequestsSelector};
