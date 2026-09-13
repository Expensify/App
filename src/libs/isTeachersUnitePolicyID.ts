import CONST from '@src/CONST';

import type EnvironmentType from './Environment/getEnvironment/types';

import getEnvironment from './Environment/getEnvironment';

let environment: EnvironmentType;
getEnvironment().then((env) => {
    environment = env;
});

export default function isTeachersUnitePolicyID(policyID: string | undefined): boolean {
    const teacherUnitePolicyID = environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.TEACHERS_UNITE.PROD_POLICY_ID : CONST.TEACHERS_UNITE.TEST_POLICY_ID;
    return policyID === teacherUnitePolicyID;
}
