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
};

export type {CreateDomainForm};
export default INPUT_IDS;
