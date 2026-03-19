import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
    DEFAULT_GROUP_FOR_NEW_MEMBERS: 'isDefaultGroup',
    STRICTLY_ENFORCE_WORKSPACE_RULES: 'enableStrictPolicyRules',
    RESTRICT_DEFAULT_LOGIN_SELECTION: 'enableRestrictedPrimaryLogin',
    RESTRICT_EXPENSE_WORKSPACE_CREATION: 'enableRestrictedPolicyCreation',
    PREFERRED_WORKSPACE: 'enableRestrictedPrimaryPolicy',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type DomainGroupCreateForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.DEFAULT_GROUP_FOR_NEW_MEMBERS]: boolean;
        [INPUT_IDS.STRICTLY_ENFORCE_WORKSPACE_RULES]: boolean;
        [INPUT_IDS.RESTRICT_DEFAULT_LOGIN_SELECTION]: boolean;
        [INPUT_IDS.RESTRICT_EXPENSE_WORKSPACE_CREATION]: boolean;
        [INPUT_IDS.PREFERRED_WORKSPACE]: boolean;
    }
>;

export type {DomainGroupCreateForm};
export default INPUT_IDS;
