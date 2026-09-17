import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
    CURRENCY: 'currency',
    PLAN_TYPE: 'planType',
    OWNER: 'owner',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;
type PolicyType = typeof CONST.POLICY.TYPE.TEAM | typeof CONST.POLICY.TYPE.CORPORATE;

type WorkspaceConfirmationForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.CURRENCY]: string;
        [INPUT_IDS.PLAN_TYPE]: PolicyType;
        [INPUT_IDS.OWNER]: string;
    }
>;

export type {WorkspaceConfirmationForm, PolicyType};
export default INPUT_IDS;
