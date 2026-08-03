import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import type {OpenPolicyRoomsPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type OpenPolicyRoomsPageOptions = {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: 'name' | 'memberCount';
    sortOrder?: 'asc' | 'desc';
    searchValue?: string;
};

/**
 * Fetches a single page of the policy's rooms. The rooms themselves are merged into the report collection through
 * onyxData, but `hasMoreResults` only exists on the response, so the caller needs the promise to know whether another
 * page can be loaded. That is why this is a side-effect request rather than API.read.
 */
function openPolicyRoomsPage(policyID: string, options: OpenPolicyRoomsPageOptions = {}) {
    const params: OpenPolicyRoomsPageParams = {
        policyID,
        ...options,
    };

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.ARE_POLICY_ROOMS_LOADED>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ARE_POLICY_ROOMS_LOADED,
            value: {
                [policyID]: true,
            },
        },
    ];

    return waitForWrites(READ_COMMANDS.OPEN_POLICY_ROOMS_PAGE).then(() => makeRequestWithSideEffects(READ_COMMANDS.OPEN_POLICY_ROOMS_PAGE, params, {finallyData}));
}

function setRoomIDToHighlightOnRoomsPage(reportID: string) {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, reportID);
}

function clearRoomIDToHighlightOnRoomsPage() {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, null);
}

export {openPolicyRoomsPage, setRoomIDToHighlightOnRoomsPage, clearRoomIDToHighlightOnRoomsPage};
