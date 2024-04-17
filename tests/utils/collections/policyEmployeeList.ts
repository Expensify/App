import {randWord} from '@ngneat/falso';
import type {PolicyEmployee} from '@src/types/onyx';

export default function createRandomPolicyEmployeeList(): PolicyEmployee {
    return {
        role: randWord(),
        errors: {},
    };
}
