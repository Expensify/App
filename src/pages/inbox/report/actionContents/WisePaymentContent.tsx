import {useSession} from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';
import type {WisePaymentAmounts} from '@components/WisePaymentSummary/types';
import {isCrossBorderWisePayment} from '@components/WisePaymentSummary/utils/getPaidWisePaymentAmounts';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {openLink} from '@libs/actions/Link';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type WisePaymentContentProps = {
    /** What was paid and from which account, without the arrival date. HTML, since the auto-paid variant links to the workspace rules */
    paymentMessage: string;

    expectedDate: string | undefined;

    /** Missing until the backend adds the final amounts to the pay action, a few seconds after Pay */
    amounts: WisePaymentAmounts | undefined;

    reportID: string | undefined;
};

/** The paid message of a Wise payment: when the money arrives, and for a cross-border payment a link to its fees and FX rate */
function WisePaymentContent({paymentMessage, expectedDate, amounts, reportID}: WisePaymentContentProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {environmentURL} = useEnvironment();
    const session = useSession();

    const formattedExpectedDate = expectedDate ? DateUtils.formatWithUTCTimeZone(expectedDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT, dateFnsLocale) : undefined;
    const message = formattedExpectedDate ? translate('iou.wisePaymentArrival', {paymentMessage, expectedDate: formattedExpectedDate}) : paymentMessage;

    const shouldLinkPaymentDetails = !!reportID && !!amounts && isCrossBorderWisePayment(amounts);
    const detailsPath = `/${DYNAMIC_ROUTES.PAYMENT_DETAILS.path}`;
    const html = shouldLinkPaymentDetails ? translate('iou.wisePaymentDetailsLink', {paymentMessage: message, href: `${ROUTES.REPORT_WITH_ID.getRoute(reportID)}${detailsPath}`}) : message;

    const handleLinkPress = (event: GestureResponderEvent | KeyboardEvent, href: string) => {
        if (!href.endsWith(detailsPath)) {
            openLink(href, environmentURL, false, session);
            return;
        }
        // The details open on top of the screen showing the message, which may be the report or a Search pane
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PAYMENT_DETAILS.path));
    };

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML
                html={`<comment><muted-text>${html}</muted-text></comment>`}
                isSelectable={!canUseTouchScreen() || !shouldUseNarrowLayout}
                onLinkPress={handleLinkPress}
            />
        </ReportActionItemBasicMessage>
    );
}

export default WisePaymentContent;
