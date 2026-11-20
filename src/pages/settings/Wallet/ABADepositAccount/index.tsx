import Navigation from '@libs/Navigation/Navigation';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import ABADepositDetails from './ABADepositDetails';
import ABADepositSuccess from './ABADepositSuccess';

type ABADepositAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_ABA_BANK_ACCOUNT>;

function ABADepositAccountPage({route}: ABADepositAccountPageProps) {
    if (route.params?.subPage === CONST.ABA_DEPOSIT_ACCOUNT.SUB_PAGE_NAMES.SUCCESS) {
        return <ABADepositSuccess onFinish={() => Navigation.dismissModal()} />;
    }

    return (
        <ABADepositDetails
            onBackButtonPress={() => Navigation.goBack()}
            onSuccess={() => Navigation.navigate(ROUTES.SETTINGS_ADD_ABA_BANK_ACCOUNT.getRoute(CONST.ABA_DEPOSIT_ACCOUNT.SUB_PAGE_NAMES.SUCCESS))}
        />
    );
}

export default ABADepositAccountPage;
