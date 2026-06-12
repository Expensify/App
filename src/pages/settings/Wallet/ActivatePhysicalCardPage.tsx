import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import ActivatePhysicalCardPageBase from './ActivatePhysicalCardPageBase';

type ActivatePhysicalCardPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_ACTIVATE>;

function ActivatePhysicalCardPage({
    route: {
        params: {cardID = ''},
    },
}: ActivatePhysicalCardPageProps) {
    return <ActivatePhysicalCardPageBase cardID={cardID} />;
}

export default ActivatePhysicalCardPage;
