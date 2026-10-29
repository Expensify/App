import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportCardActivateNavigatorParamList} from '@libs/Navigation/types';

import ActivatePhysicalCardPageBase from '@pages/settings/Wallet/ActivatePhysicalCardPageBase';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type ActivatePhysicalCardPageProps = PlatformStackScreenProps<ReportCardActivateNavigatorParamList, typeof SCREENS.REPORT_CARD_ACTIVATE>;

function ActivatePhysicalCardPage({
    route: {
        params: {cardID = '', reportID, reportActionID},
    },
}: ActivatePhysicalCardPageProps) {
    return (
        <ActivatePhysicalCardPageBase
            cardID={cardID}
            navigateBackTo={ROUTES.REPORT_WITH_ID.getRoute(cardID, reportID, reportActionID)}
        />
    );
}

export default ActivatePhysicalCardPage;
