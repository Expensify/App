import {useSession} from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {openLink} from '@libs/actions/Link';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type WisePaymentDetailsMessageProps = {
    /** The paid message, as HTML since the auto-paid variant links to the workspace rules */
    message: string;

    reportID: string;
};

/** The paid message of a Wise payment, followed by a link to its final amounts, fees and FX rate */
function WisePaymentDetailsMessage({message, reportID}: WisePaymentDetailsMessageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {environmentURL} = useEnvironment();
    const session = useSession();

    const detailsPath = `/${DYNAMIC_ROUTES.PAYMENT_DETAILS.path}`;
    const detailsLink = `<a href="${environmentURL}/${ROUTES.REPORT_WITH_ID.getRoute(reportID)}${detailsPath}">${translate('iou.viewDetails')}</a>`;

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
                html={`<comment><muted-text>${message} ${detailsLink}</muted-text></comment>`}
                isSelectable={!canUseTouchScreen() || !shouldUseNarrowLayout}
                onLinkPress={handleLinkPress}
            />
        </ReportActionItemBasicMessage>
    );
}

export default WisePaymentDetailsMessage;
