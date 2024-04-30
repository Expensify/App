import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import * as SearchUtils from '@libs/SearchUtils';

function search(query: string) {
    const hash = SearchUtils.getQueryHash(query);
    API.read(READ_COMMANDS.SEARCH, {query, hash});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    search,
};
