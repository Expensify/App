import CONST from '@src/CONST';

const businessInfoStepKeys = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY;

type BusinessInfoData = {
    [businessInfoStepKeys.COMPANY_NAME]: string;
    [businessInfoStepKeys.COMPANY_TAX_ID]: string;
    [businessInfoStepKeys.COMPANY_WEBSITE]: string;
    [businessInfoStepKeys.COMPANY_PHONE]: string;
    [businessInfoStepKeys.COMPANY_NAME]: string;
    [businessInfoStepKeys.STREET]: string;
    [businessInfoStepKeys.CITY]: string;
    [businessInfoStepKeys.STATE]: string;
    [businessInfoStepKeys.ZIP_CODE]: string;
    [businessInfoStepKeys.INCORPORATION_TYPE]: string;
    [businessInfoStepKeys.INCORPORATION_DATE]: string;
    [businessInfoStepKeys.INCORPORATION_STATE]: string;
};

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
