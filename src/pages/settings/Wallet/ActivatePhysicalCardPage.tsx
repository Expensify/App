import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import ActivatePhysicalCardPageBase from './ActivatePhysicalCardPageBase';

type ActivatePhysicalCardPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_ACTIVATE>;

function ActivatePhysicalCardPage({
    route: {
        params: {cardID = '', isFromDomainCardDetail},
    },
}: ActivatePhysicalCardPageProps) {
    return (
        <ActivatePhysicalCardPageBase
            cardID={cardID}
            isFromDomainCardDetail={!!isFromDomainCardDetail}
        />
    );
}

export default ActivatePhysicalCardPage;
