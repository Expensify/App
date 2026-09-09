import * as CommonTypes from './common';

type PolicyMemberListType = CommonTypes.BaseState & {
    /** Role of the user in the policy */
    role: string;
};

export default PolicyMemberListType;
