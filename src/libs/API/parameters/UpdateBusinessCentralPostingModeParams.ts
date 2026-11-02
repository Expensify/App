import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralPostingModeParams = {
    policyID: string;
    postingMode: BusinessCentralExport['postingMode'];
};

export default UpdateBusinessCentralPostingModeParams;
