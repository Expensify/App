import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    RATE: 'rate',
    UNIT: 'unit',
} as const;

type WorkspaceRateAndUnitForm = Form<{
    [INPUT_IDS.RATE]: string;
    [INPUT_IDS.UNIT]: string;
}>;

export type {WorkspaceRateAndUnitForm};
export default INPUT_IDS;
