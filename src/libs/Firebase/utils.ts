import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {FirebaseAttributes} from './types';

/**
 * Gets attributes for firebase trace
 */
function getAttributes(): FirebaseAttributes {
    const reportsLength = ReportUtils.getAllReportsLength().toString();
    const personalDetailsLength = PersonalDetailsUtils.getPersonalDetailsLength().toString();

    return {
        reportsLength,
        personalDetailsLength,
    };
}

export default getAttributes;
