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
>;

export type {OdooCredentialsForm};
export default INPUT_IDS;
