import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    ODOO_URL: 'odooURL',
    API_KEY: 'apiKey',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type OdooCredentialsForm = Form<
    InputID,
    {
        [INPUT_IDS.ODOO_URL]: string;
        [INPUT_IDS.API_KEY]: string;
    }
> & {
    /** Set once ConnectPolicyToOdoo accepts the URL and key, so the setup page can close */
    hasConnectionSucceeded?: boolean;
};

export type {OdooCredentialsForm};
export default INPUT_IDS;
