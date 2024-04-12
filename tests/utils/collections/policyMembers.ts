import {rand} from '@ngneat/falso';
import CONST from '@src/CONST';
import type {PolicyMember} from '@src/types/onyx';

export default function createRandomPolicyMember(): PolicyMember {
    return {
        role: rand(Object.values(CONST.POLICY.ROLE)),
        errors: {},
    };
}
