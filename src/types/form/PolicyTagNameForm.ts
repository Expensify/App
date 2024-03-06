import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    POLICY_TAGS_NAME: 'policyTagsName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type PolicyTagNameForm = Form<string, Record<string, string>>;

// eslint-disable-next-line import/prefer-default-export
export type {PolicyTagNameForm};
export default INPUT_IDS;
