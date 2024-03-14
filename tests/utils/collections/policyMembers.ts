import {randWord} from '@ngneat/falso';
import type PolicyMember from '@src/types/onyx/PolicyMember';

export default function createRandomPolicyMember(): PolicyMember {
    return {
        role: randWord(),
        errors: {},
    };
}
