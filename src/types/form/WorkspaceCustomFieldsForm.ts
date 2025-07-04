import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CUSTOM_FIELD: 'customField',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceMemberCustomFieldsForm = Form<
    InputID,
    {
        [INPUT_IDS.CUSTOM_FIELD]: string;
    }
>;

export type {WorkspaceMemberCustomFieldsForm};
export default INPUT_IDS;
