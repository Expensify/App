import {randAvatar, randEmail, randWord} from '@ngneat/falso';
import type {PersonalDetails} from '@src/types/onyx';

export default function createPersonalDetails(index: number): PersonalDetails {
    return {
        accountID: index,
        avatar: randAvatar(),
        displayName: randWord(),
        lastName: randWord(),
        login: randEmail(),
    };
}
