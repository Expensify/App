import {read} from '@libs/API';
import type {OpenPolicyRoomsPageParams, OpenWorkspaceRoomsPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

function openPolicyRoomsPage(policyID: string) {
    const params: OpenPolicyRoomsPageParams = {policyID};

    read(READ_COMMANDS.OPEN_POLICY_ROOMS_PAGE, params);
}

export default function openWorkspaceRoomsPage(policyID: string) {
    if (!policyID) {
        Log.warn('openWorkspaceRoomsPage invalid params', {policyID});
        return;
    }

    const params: OpenWorkspaceRoomsPageParams = {policyID};

    read(READ_COMMANDS.OPEN_WORKSPACE_ROOMS_PAGE, params);
}

export {openPolicyRoomsPage};
