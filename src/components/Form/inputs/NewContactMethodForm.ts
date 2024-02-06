import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    PHONE_OR_EMAIL: 'phoneOrEmail',
} as const;

type NewContactMethodForm = Form<{
    [INPUT_IDS.PHONE_OR_EMAIL]: string;
}>;

export default NewContactMethodForm;
export {INPUT_IDS};
