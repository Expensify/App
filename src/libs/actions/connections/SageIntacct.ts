import * as API from '@libs/API';
import type ConnectPolicyToSageIntacctParams from '@libs/API/parameters/ConnectPolicyToSageIntacctParams';
import {WRITE_COMMANDS} from '@libs/API/types';

type SageIntacctCredentials = {companyID: string; userID: string; password: string};

function connectToSageIntacct(policyID: string, credentials: SageIntacctCredentials) {
    const parameters: ConnectPolicyToSageIntacctParams = {
        policyID,
        intacctCompanyID: credentials.companyID,
        intacctUserID: credentials.userID,
        intacctPassword: credentials.password,
    };
    API.write(WRITE_COMMANDS.CONNECT_POLICY_TO_SAGE_INTACCT, parameters, {});
}

export default connectToSageIntacct;
