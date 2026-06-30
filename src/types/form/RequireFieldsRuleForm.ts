import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CATEGORY: 'category',
    REQUIRE_DESCRIPTION: 'requireDescription',
    REQUIRE_RECEIPT: 'requireReceipt',
    REQUIRE_ITEMIZED_RECEIPT: 'requireItemizedReceipt',
    REQUIRE_ATTENDEES: 'requireAttendees',
} as const;

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
export default INPUT_IDS;
