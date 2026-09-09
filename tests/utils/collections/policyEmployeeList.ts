import type {PolicyEmployee} from '@src/types/onyx';

import {randWord} from '@ngneat/falso';

export default function createRandomPolicyEmployeeList(): PolicyEmployee {
    return {
        role: randWord(),
        errors: {},
    };
}
