import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function AddDepositAccount() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            title={translate('homePage.timeSensitiveSection.addDepositAccount.title')}
            subtitle={translate('common.wallet')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute()))}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddDepositAccount;
