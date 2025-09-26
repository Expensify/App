import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MoneyRequestCreateVerifyAccountPageParamList = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE_VERIFY_ACCOUNT>;

function MoneyRequestCreateVerifyAccountPage({route}: MoneyRequestCreateVerifyAccountPageParamList) {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.MONEY_REQUEST_CREATE.getRoute(route.params.action, route.params.iouType, route.params.transactionID, route.params.reportID)} />;
}

export default MoneyRequestCreateVerifyAccountPage;
