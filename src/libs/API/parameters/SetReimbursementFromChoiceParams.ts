import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type SetReimbursementFromChoiceParams = {
    policyID: string;
    reimbursementChoice: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;
};

export default SetReimbursementFromChoiceParams;
