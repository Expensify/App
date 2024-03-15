import {randWord} from '@ngneat/falso';
import type {PolicyMember} from '@src/types/onyx';

export default function createRandomPolicyMember(hasError = false): PolicyMember {
    return {
        role: randWord(),
        errors: hasError ? {someError: 'Message'} : {},
    };
}
