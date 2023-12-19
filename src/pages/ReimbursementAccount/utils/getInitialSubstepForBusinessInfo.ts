import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

const businessInfoStepKeys = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY;

type BusinessInfoData = Record<ValueOf<typeof businessInfoStepKeys>, string>;

/**
 * Returns the initial substep for the Business Info step based on already existing data
 */
function getInitialSubstepForBusinessInfo(data: BusinessInfoData): number {
    if (data[businessInfoStepKeys.COMPANY_NAME] === '') {
        return 0;
    }

    if (data[businessInfoStepKeys.COMPANY_TAX_ID] === '') {
        return 1;
    }

    if (data[businessInfoStepKeys.COMPANY_WEBSITE] === '') {
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
