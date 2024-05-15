import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

function search(hash: number, query: string, policyIDs?: string) {
    API.read(READ_COMMANDS.SEARCH, {hash, query, policyIDs});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    search,
};
