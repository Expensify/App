import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_COLLECT_DEPOSIT_ACCOUNT.getRoute(Navigation.getActiveRoute()))}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddDepositAccount;
