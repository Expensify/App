import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    RATE: 'rate',
    UNIT: 'unit',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type WorkspaceRateAndUnitForm = Form<
    InputIDs,
    {
        [INPUT_IDS.RATE]: string;
        [INPUT_IDS.UNIT]: string;
    }
>;

export type {WorkspaceRateAndUnitForm};
export default INPUT_IDS;
