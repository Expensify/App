import * as ValidationUtils from '@libs/ValidationUtils';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {CompanyStepProps} from '@src/types/form/ReimbursementAccountForm';

const businessInfoStepKeys = INPUT_IDS.BUSINESS_INFO_STEP;

/**
 * Returns the initial substep for the Business Info step based on already existing data
 */
function getInitialSubstepForBusinessInfo(data: CompanyStepProps): number {
    if (data[businessInfoStepKeys.COMPANY_NAME] === '') {
        return 0;
    }

    if (data[businessInfoStepKeys.COMPANY_TAX_ID] === '') {
        return 1;
    }

    if (!ValidationUtils.isValidWebsite(data[businessInfoStepKeys.COMPANY_WEBSITE])) {
        return 2;
    }

    if (data[businessInfoStepKeys.COMPANY_PHONE] === '') {
        return 3;
    }

    if (data[businessInfoStepKeys.STREET] === '' || data[businessInfoStepKeys.CITY] === '' || data[businessInfoStepKeys.STATE] === '' || data[businessInfoStepKeys.ZIP_CODE] === '') {
        return 4;
    }

    if (data[businessInfoStepKeys.INCORPORATION_TYPE] === '') {
        return 5;
    }

    if (data[businessInfoStepKeys.INCORPORATION_DATE] === '') {
        return 6;
    }

    if (data[businessInfoStepKeys.INCORPORATION_STATE] === '') {
        return 7;
    }

    return 8;
}

export default getInitialSubstepForBusinessInfo;
