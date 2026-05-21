import {read} from '@libs/API';
import type {OpenWorkspaceRoomsPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

export default function openWorkspaceRoomsPage(policyID: string) {
    if (!policyID) {
        Log.warn('openWorkspaceRoomsPage invalid params', {policyID});
        return;
    }

    const params: OpenWorkspaceRoomsPageParams = {policyID};

    read(READ_COMMANDS.OPEN_WORKSPACE_ROOMS_PAGE, params);
}
