import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {FirebaseAttributes} from './types';

/**
 * Getting attributes for firebase trace
 */
function getFirebaseAttributes(): FirebaseAttributes {
    const reportsLength = ReportUtils.getAllReportsLength().toString();
    const personalDetailsLength = PersonalDetailsUtils.getPersonalDetailsLength().toString();

    return {
        reportsLength,
        personalDetailsLength,
    };
}

export default getFirebaseAttributes;
