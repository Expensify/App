import {read} from '@libs/API';
import type {OpenPolicyRoomsPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';

function openPolicyRoomsPage(policyID: string) {
    const params: OpenPolicyRoomsPageParams = {policyID};

    read(READ_COMMANDS.OPEN_POLICY_ROOMS_PAGE, params);
}

// eslint-disable-next-line import/prefer-default-export
export {openPolicyRoomsPage};
