import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateNetSuiteCustomFormIDParams = {
    policyID: string;
    formID: string;
    formType: ValueOf<typeof CONST.NETSUITE_MAP_EXPORT_DESTINATION>;
};

export default UpdateNetSuiteCustomFormIDParams;
