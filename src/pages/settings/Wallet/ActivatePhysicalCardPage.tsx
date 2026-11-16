import useDynamicBackPath from '@hooks/useDynamicBackPath';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import ActivatePhysicalCardPageBase from './ActivatePhysicalCardPageBase';

type ActivatePhysicalCardPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_ACTIVATE>;

function ActivatePhysicalCardPage({
    route: {
        params: {cardID = ''},
    },
}: ActivatePhysicalCardPageProps) {
    const cardDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.WALLET_CARD_ACTIVATE.path);

    return (
        <ActivatePhysicalCardPageBase
            cardID={cardID}
            cardDetailsPath={cardDetailsPath}
        />
    );
}

export default ActivatePhysicalCardPage;
