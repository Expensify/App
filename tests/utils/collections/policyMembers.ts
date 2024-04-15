import CONST from '@src/CONST';
import type {PolicyMember} from '@src/types/onyx';

export default function createRandomPolicyMember(): PolicyMember {
    return {
        role: CONST.POLICY.ROLE.USER,
        errors: {},
    };
}
