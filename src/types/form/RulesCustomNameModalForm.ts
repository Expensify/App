import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CUSTOM_NAME: 'customName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesCustomNameModalForm = Form<
    InputID,
    {
        [INPUT_IDS.CUSTOM_NAME]: string;
    }
>;

export type {RulesCustomNameModalForm};
export default INPUT_IDS;
