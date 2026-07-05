import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import colors from '@styles/theme/colors';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function ValidateAccount() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['EnvelopeOpenStar']);

    return (
        <BaseWidgetItem
            icon={icons.EnvelopeOpenStar}
            iconBackgroundColor={colors.green100}
            iconFill={colors.green500}
            title={translate('homePage.timeSensitiveSection.validateAccount.title')}
            subtitle={translate('homePage.timeSensitiveSection.validateAccount.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.validateAccount.cta')}
            onCtaPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path))}
            buttonProps={{success: true}}
        />
    );
}

export default ValidateAccount;
