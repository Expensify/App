import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    CATEGORY: 'category',
    DESCRIPTION_SETTING: 'descriptionSetting',
    ATTENDEES_SETTING: 'attendeesSetting',
    RECEIPT_SETTING: 'receiptSetting',
    ITEMIZED_RECEIPT_SETTING: 'itemizedReceiptSetting',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type FieldRequirementSetting = ValueOf<typeof CONST.FIELD_REQUIREMENTS_DIRECTION>;

type RequireFieldsRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.DESCRIPTION_SETTING]: FieldRequirementSetting;
        [INPUT_IDS.ATTENDEES_SETTING]: FieldRequirementSetting;
        [INPUT_IDS.RECEIPT_SETTING]: FieldRequirementSetting;
        [INPUT_IDS.ITEMIZED_RECEIPT_SETTING]: FieldRequirementSetting;
    }
>;

type RequireFieldsRuleSettingFieldKey = Exclude<InputID, typeof INPUT_IDS.CATEGORY>;

export type {RequireFieldsRuleForm, RequireFieldsRuleSettingFieldKey};
export default INPUT_IDS;
