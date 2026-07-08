import type {CardFeed} from '@src/types/onyx';
import type {RilletAccount} from '@src/types/onyx/Policy';

type UpdateRilletCardProgramAccountParams = {
    policyID: string;
    feedKey: CardFeed;
    accountCode: RilletAccount['code'];
};

export default UpdateRilletCardProgramAccountParams;
