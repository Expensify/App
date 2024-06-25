import * as API from '@libs/API';
import type ConnectPolicyToSageIntacctParams from '@libs/API/parameters/ConnectPolicyToSageIntacctParams';
import {READ_COMMANDS} from '@libs/API/types';

function connectToSageIntacct(policyID: string, companyID?: string, userID?: string, password?: string) {
    const parameters: ConnectPolicyToSageIntacctParams = {
        policyID,
        intacctCompanyID: companyID,
        intacctUserID: userID,
        intacctPassword: password,
    };
    API.read(READ_COMMANDS.CONNECT_POLICY_TO_SAGE_INTACCT, parameters, {});
}

export default connectToSageIntacct;
