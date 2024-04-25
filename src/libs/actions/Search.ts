import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {READ_COMMANDS} from '@libs/API/types';

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

    const hash = UserUtils.hashText(query, 2 ** 32);
    API.read(READ_COMMANDS.SEARCH, {query, hash});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    search,
};
