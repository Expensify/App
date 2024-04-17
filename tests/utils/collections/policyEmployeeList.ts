import {rand} from '@ngneat/falso';
import CONST from '@src/CONST';
import type {PolicyEmployee} from '@src/types/onyx';

export default function createRandomPolicyEmployeeList(): PolicyEmployee {
    return {
        role: rand(Object.values(CONST.POLICY.ROLE)),
        errors: {},
    };
}
