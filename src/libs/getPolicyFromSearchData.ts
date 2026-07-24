import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxEntry} from 'react-native-onyx';

import getNonEmptyStringOnyxID from './getNonEmptyStringOnyxID';

/**
 * Reads a policy from a search results snapshot by policy ID. `SearchResults['data']` is a heterogeneous
 * keyed bag, so this localizes the otherwise-unavoidable cast to a single typed accessor.
 */
export default function getPolicyFromSearchData(data: SearchResults['data'] | undefined, policyID: string | undefined): OnyxEntry<Policy> {
    return data?.[`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`] as OnyxEntry<Policy>;
}
