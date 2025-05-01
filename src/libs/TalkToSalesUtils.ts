import {Close, Phone} from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import getPlatform from './getPlatform';
import {translateLocal} from './Localize';

type GetTalkToSalesDataProps = {
    accountID?: number;
    introSelected?: {companySize?: string};
    talkToAISales?: {isTalkingToAISales?: boolean; isLoading?: boolean};
    reportID?: string;
};

function getTalkToSalesData({accountID, introSelected, talkToAISales, reportID}: GetTalkToSalesDataProps) {
    if (!reportID || !accountID) {
        return;
    }

    const isNativePlatform = getPlatform() === CONST.PLATFORM.IOS || getPlatform() === CONST.PLATFORM.ANDROID;

    if (introSelected?.companySize !== CONST.ONBOARDING_COMPANY_SIZE.MICRO || isNativePlatform) {
        return null;
    }

    const availableCTAs = [translateLocal('aiSales.getHelp'), translateLocal('aiSales.talkToSales'), translateLocal('aiSales.talkToConcierge')];
    const abTestCtaText = availableCTAs.at(accountID % availableCTAs.length) ?? translateLocal('aiSales.talkToSales');

    const talkToSaleText = talkToAISales?.isTalkingToAISales ? translateLocal('aiSales.hangUp') : abTestCtaText;
    const talkToSalesIcon = talkToAISales?.isTalkingToAISales ? Close : Phone;

    return {
        talkToSalesIcon,
        talkToSaleText,
        abTestCtaText,
    };
}

export default getTalkToSalesData;
