import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DOMAIN_NAME: 'domainName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ResetDomainForm = Form<
    InputID,
    {
        [INPUT_IDS.DOMAIN_NAME]: string;
    }
>;

export type {ResetDomainForm};
export default INPUT_IDS;
