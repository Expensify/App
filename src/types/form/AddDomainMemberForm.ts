import type {ValueOf} from 'type-fest';
import type Form from '@src/types/form/Form';

const INPUT_IDS = {
    EMAIL: 'email',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AddDomainMemberForm = Form<
    InputID,
    {
        [INPUT_IDS.EMAIL]: string;
    }
>;

export type {AddDomainMemberForm};
export default INPUT_IDS;
