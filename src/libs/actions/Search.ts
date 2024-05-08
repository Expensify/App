import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import * as SearchUtils from '@libs/SearchUtils';

function search(query: string, policyID?: string) {
    const hash = SearchUtils.getQueryHash(query, policyID);
    API.read(READ_COMMANDS.SEARCH, {query, policyID, hash});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    search,
};
