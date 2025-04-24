import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CUSTOM_RULES: 'customRules',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesCustomForm = Form<
    InputID,
    {
        [INPUT_IDS.CUSTOM_RULES]: string;
    }
>;

export type {RulesCustomForm};
export default INPUT_IDS;
