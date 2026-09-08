import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {fromUnixTime} from 'date-fns';
import React from 'react';

type PayOverdueInvoiceProps = {
    /** Unix timestamp (seconds) of the billing grace period end, shown as the invoice due date */
    gracePeriodEndUnixSeconds: number;
};

function PayOverdueInvoice({gracePeriodEndUnixSeconds}: PayOverdueInvoiceProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bill']);

    // formatWithUTCTimeZone parses ISO 8601, so an RFC 1123 string from toUTCString would silently format as empty
    const dueDate = DateUtils.formatWithUTCTimeZone(fromUnixTime(gracePeriodEndUnixSeconds).toISOString(), CONST.DATE.MONTH_DAY_YEAR_FORMAT, dateFnsLocale);

    const handleReviewPress = () => {
        const query = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.INVOICE});
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
    };

    return (
        <BaseWidgetItem
            icon={icons.Bill}
            title={translate('homePage.timeSensitiveSection.payOverdueInvoice.title', {date: dueDate})}
            ctaText={translate('homePage.timeSensitiveSection.payOverdueInvoice.cta')}
            onCtaPress={handleReviewPress}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
        />
    );
}

export default PayOverdueInvoice;
