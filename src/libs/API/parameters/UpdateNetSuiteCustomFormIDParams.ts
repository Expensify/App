import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateNetSuiteCustomFormIDParams = {
    policyID: string;
    formID: string;
    formType: ValueOf<typeof CONST.NETSUITE_MAP_EXPORT_DESTINATION>;
};

export default UpdateNetSuiteCustomFormIDParams;
