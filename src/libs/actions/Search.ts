import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import * as SearchUtils from '@libs/SearchUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

function search(query: string) {
    const hash = SearchUtils.getQueryHash(query);
    API.read(READ_COMMANDS.SEARCH, {query, hash});
}

function addPersonalDetailsFromSearch(personalDetails: OnyxEntry<PersonalDetailsList>) {
    return Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    addPersonalDetailsFromSearch,
    search,
};
