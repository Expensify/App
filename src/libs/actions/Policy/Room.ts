import {read} from '@libs/API';
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
 * Fetches a single page of the policy's rooms. The rooms are merged into the report collection by the response's
 * onyxData, which also carries `hasMoreResults` so the rooms page knows whether another page can be requested.
 * `isLoading` and `pageNumber` are written here so the page can tell a first load (full skeleton) apart from loading
 * another page (footer spinner).
 */
function openPolicyRoomsPage(policyID: string, options: OpenPolicyRoomsPageOptions = {}) {
    const params: OpenPolicyRoomsPageParams = {
        policyID,
        ...options,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.POLICY_ROOMS_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.POLICY_ROOMS_METADATA,
            value: {
                [policyID]: {
                    isLoading: true,
                    pageNumber: options.pageNumber,
                },
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.POLICY_ROOMS_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.POLICY_ROOMS_METADATA,
            value: {
                [policyID]: {
                    isLoading: false,
                    isLoaded: true,
                },
            },
        },
    ];

    read(READ_COMMANDS.OPEN_POLICY_ROOMS_PAGE, params, {optimisticData, finallyData});
}

function setRoomIDToHighlightOnRoomsPage(reportID: string) {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, reportID);
}

function clearRoomIDToHighlightOnRoomsPage() {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, null);
}

export {openPolicyRoomsPage, setRoomIDToHighlightOnRoomsPage, clearRoomIDToHighlightOnRoomsPage};
