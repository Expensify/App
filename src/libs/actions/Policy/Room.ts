import {read} from '@libs/API';
import type {OpenPolicyRoomsPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function openPolicyRoomsPage(policyID: string) {
    const params: OpenPolicyRoomsPageParams = {policyID};

    read(READ_COMMANDS.OPEN_POLICY_ROOMS_PAGE, params);
}

function setRoomIDToHighlightOnRoomsPage(reportID: string) {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, reportID);
}

function clearRoomIDToHighlightOnRoomsPage() {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, null);
}

export {openPolicyRoomsPage, setRoomIDToHighlightOnRoomsPage, clearRoomIDToHighlightOnRoomsPage};
