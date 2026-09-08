import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    DOMAIN_NAME: 'domainName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type CreateDomainForm = Form<
    InputID,
    {
        [INPUT_IDS.DOMAIN_NAME]: string;
    }
> & {
    /** Whether domain creation has succeeded */
    hasCreationSucceeded?: boolean;
    /** The domain accountID of the existing domain, set when creation fails because the domain already exists */
    domainAccountID?: number;
    /** Domain Onyx keys present before submitting, used to distinguish an existing entry from the response-only failure entry */
    domainKeysBeforeCreation?: string[];
};

export type {CreateDomainForm};
export default INPUT_IDS;
