import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';

function getDomainValidationCode(accountID: number) {
    API.read(READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE, {accountID});
}

function validateDomain(accountID: number) {
    API.write(WRITE_COMMANDS.VALIDATE_DOMAIN, {accountID});
}

export {getDomainValidationCode, validateDomain};
