import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

function fetchUnreportedExpenses(offset: number) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS,
            value: true,
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS,
            value: false,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS,
            value: false,
        },
    ];

    API.read(READ_COMMANDS.OPEN_UNREPORTED_EXPENSES_PAGE, {offset}, {optimisticData, successData, failureData});
}

// eslint-disable-next-line import/prefer-default-export
export {fetchUnreportedExpenses};
