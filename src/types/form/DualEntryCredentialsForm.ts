import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    API_KEY: 'apiKey',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type DualEntryCredentialsForm = Form<
    InputID,
    {
        [INPUT_IDS.API_KEY]: string;
    }
>;

export type {DualEntryCredentialsForm};
export default INPUT_IDS;
