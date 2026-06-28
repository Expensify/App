import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = CONST.REQUIRE_FIELDS_RULE.FIELDS;

type InputID = ValueOf<typeof INPUT_IDS>;

type RequireFieldsRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.REQUIRE_DESCRIPTION]: boolean;
        [INPUT_IDS.REQUIRE_RECEIPT]: boolean;
        [INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT]: boolean;
        [INPUT_IDS.REQUIRE_ATTENDEES]: boolean;
    }
>;

type RequireFieldsRuleToggleFieldKey = Exclude<InputID, typeof INPUT_IDS.CATEGORY>;

export type {RequireFieldsRuleForm, RequireFieldsRuleToggleFieldKey};
