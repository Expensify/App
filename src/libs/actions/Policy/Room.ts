import {read} from '@libs/API';
import type {OpenPolicyRoomsPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function openPolicyRoomsPage(policyID: string) {
    const params: OpenPolicyRoomsPageParams = {policyID};

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.ARE_POLICY_ROOMS_LOADED>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ARE_POLICY_ROOMS_LOADED,
            value: {
                [policyID]: true,
            },
        },
    ];

    read(READ_COMMANDS.OPEN_POLICY_ROOMS_PAGE, params, {finallyData});
}

function setRoomIDToHighlightOnRoomsPage(reportID: string) {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, reportID);
}

function clearRoomIDToHighlightOnRoomsPage() {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, null);
}

export {openPolicyRoomsPage, setRoomIDToHighlightOnRoomsPage, clearRoomIDToHighlightOnRoomsPage};
