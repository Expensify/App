import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxCollection} from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import * as SearchUtils from '@libs/SearchUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, SearchResults} from '@src/types/onyx';

let allSnapshots: OnyxCollection<SearchResults> = null;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.SNAPSHOT,
    callback: (val) => (allSnapshots = val),
});

function search(query: string) {
    const hash = SearchUtils.getQueryHash(query);
    API.read(READ_COMMANDS.SEARCH, {query, hash});
}

function getPersonalDetails(hash: string, accountID: number): OnyxEntry<PersonalDetails> {
    const key = `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`;
    return allSnapshots?.[key]?.data?.[ONYXKEYS.PERSONAL_DETAILS_LIST]?.[accountID];
} 

export {
    search,
    getPersonalDetails,
};
