import Onyx from 'react-native-onyx';
import {read} from '@libs/API';
import type {OpenWorkspaceRoomsPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

export default function openWorkspaceRoomsPage(policyID: string) {
    if (!policyID) {
        Log.warn('openWorkspaceRoomsPage invalid params', {policyID});
        return;
    }

    const params: OpenWorkspaceRoomsPageParams = {policyID};

    read(READ_COMMANDS.OPEN_WORKSPACE_ROOMS_PAGE, params);
}

function setRoomIDToHighlightOnRoomsPage(reportID: string) {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, reportID);
}

function clearRoomIDToHighlightOnRoomsPage() {
    Onyx.set(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE, null);
}

export {setRoomIDToHighlightOnRoomsPage, clearRoomIDToHighlightOnRoomsPage};
