import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    TENANT_ID: 'tenantID',
    ENVIRONMENT_NAME: 'environmentName',
    CLIENT_ID: 'clientID',
    CLIENT_SECRET: 'clientSecret',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type BusinessCentralCredentialsForm = Form<
    InputID,
    {
        [INPUT_IDS.TENANT_ID]: string;
        [INPUT_IDS.ENVIRONMENT_NAME]: string;
        [INPUT_IDS.CLIENT_ID]: string;
        [INPUT_IDS.CLIENT_SECRET]: string;
    }
>;

export type {BusinessCentralCredentialsForm};
export default INPUT_IDS;
