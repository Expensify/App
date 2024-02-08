import type Form from './Form';

const INPUT_IDS = {
    PHONE_OR_EMAIL: 'phoneOrEmail',
} as const;

type NewContactMethodForm = Form<{
    [INPUT_IDS.PHONE_OR_EMAIL]: string;
}>;

export type {NewContactMethodForm};
export default INPUT_IDS;
