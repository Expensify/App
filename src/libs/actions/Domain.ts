import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain} from '@src/types/onyx';

function getDomainValidationCode(accountID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validateCodeLoadingStatus: 'loading'} satisfies Partial<Domain>,
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validateCodeLoadingStatus: 'success'} satisfies Partial<Domain>,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validateCodeLoadingStatus: 'error'} satisfies Partial<Domain>,
        },
    ];

    API.read(READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE, {accountID}, {optimisticData, successData, failureData});
}

function validateDomain(accountID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidationPending: true, validationError: null} satisfies Partial<Domain>,
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidationPending: false} satisfies Partial<Domain>,
        },
    ];

    API.write(WRITE_COMMANDS.VALIDATE_DOMAIN, {accountID}, {optimisticData, finallyData});
}

export {getDomainValidationCode, validateDomain};
