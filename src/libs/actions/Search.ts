import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import * as SearchUtils from '@libs/SearchUtils';
import ONYXKEYS from '@src/ONYXKEYS';

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (value) => {
        isNetworkOffline = value?.isOffline ?? false;
    },
});

function search(query: string) {
    if (isNetworkOffline) {
        return;
    }

    const hash = SearchUtils.getQueryHash(query);
    API.read(READ_COMMANDS.SEARCH, {query, hash});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    search,
};
