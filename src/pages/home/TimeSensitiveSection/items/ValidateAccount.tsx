import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function ValidateAccount() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['EnvelopeOpenStar']);

    return (
        <BaseWidgetItem
            icon={icons.EnvelopeOpenStar}
            title={translate('homePage.timeSensitiveSection.validateAccount.title')}
            ctaText={translate('homePage.timeSensitiveSection.validateAccount.cta')}
            onCtaPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path))}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default ValidateAccount;
