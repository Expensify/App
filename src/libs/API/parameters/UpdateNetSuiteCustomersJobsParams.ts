import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateNetSuiteCustomersJobsParams = {
    policyID: string;
    customersMapping: ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>;
    jobsMapping: ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>;
};

export default UpdateNetSuiteCustomersJobsParams;
