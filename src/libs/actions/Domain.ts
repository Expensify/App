import Onyx from 'react-native-onyx';
import type {NullishDeep, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain} from '@src/types/onyx';

function getDomainValidationCode(accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validateCodeLoadingStatus: 'loading'} satisfies NullishDeep<Partial<Domain>>,
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validateCodeLoadingStatus: null} satisfies NullishDeep<Partial<Domain>>,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validateCodeLoadingStatus: 'error'} satisfies NullishDeep<Partial<Domain>>,
        },
    ];

    API.read(READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE, {domainName}, {optimisticData, successData, failureData});
}

function validateDomain(accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validationPendingStatus: 'pending', domainValidationError: null} satisfies NullishDeep<Partial<Domain>>,
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validationPendingStatus: null} satisfies NullishDeep<Partial<Domain>>,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {validationPendingStatus: 'error'} satisfies NullishDeep<Partial<Domain>>,
        },
    ];

    API.write(WRITE_COMMANDS.VALIDATE_DOMAIN, {domainName}, {optimisticData, successData, failureData});
}

export {getDomainValidationCode, validateDomain};
