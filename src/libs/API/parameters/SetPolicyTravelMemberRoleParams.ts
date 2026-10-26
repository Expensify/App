import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type SetPolicyTravelMemberRoleParams = {
    policyID: string;

    /** Comma-separated accountIDs of the members to update */
    employeeAccountIDList: string;

    travelRole: ValueOf<typeof CONST.TRAVEL.MEMBER_ROLE>;
};

export default SetPolicyTravelMemberRoleParams;
