import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateNetSuiteQuickStartCustomersMapping = {
    policyID: string;
    mapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>;
};

export default UpdateNetSuiteQuickStartCustomersMapping;
