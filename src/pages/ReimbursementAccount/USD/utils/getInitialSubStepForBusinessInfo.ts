import {Str} from 'expensify-common';
import {isValidWebsite} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {CompanyStepProps} from '@src/types/form/ReimbursementAccountForm';

const businessInfoStepKeys = INPUT_IDS.BUSINESS_INFO_STEP;

/**
 * Returns the initial subStep for the Business Info step based on already existing data
 */
function getInitialSubStepForBusinessInfo(data: CompanyStepProps): number {
    if (data[businessInfoStepKeys.COMPANY_NAME] === '') {
        return 0;
    }

    if (data[businessInfoStepKeys.COMPANY_TAX_ID] === '') {
        return 1;
    }

    if (!isValidWebsite(Str.sanitizeURL(data[businessInfoStepKeys.COMPANY_WEBSITE], CONST.COMPANY_WEBSITE_DEFAULT_SCHEME))) {
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

    if (data[businessInfoStepKeys.INCORPORATION_CODE] === '') {
        return 8;
    }

    return 9;
}

export default getInitialSubStepForBusinessInfo;
