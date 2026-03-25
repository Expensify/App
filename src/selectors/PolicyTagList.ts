import type {OnyxCollection} from 'react-native-onyx';
import type {PolicyTagLists} from '@src/types/onyx';

function policyTagListSelector(tags: OnyxCollection<PolicyTagLists>): OnyxCollection<PolicyTagLists> | undefined {
    return tags ?? undefined;
}

// eslint-disable-next-line import/prefer-default-export
export {policyTagListSelector};
