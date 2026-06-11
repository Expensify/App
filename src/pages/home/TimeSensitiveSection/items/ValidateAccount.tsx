import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function ValidateAccount() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['EnvelopeOpenStar']);

    return (
        <BaseWidgetItem
            icon={icons.EnvelopeOpenStar}
            transparentIconBackground
            iconFill={theme.icon}
            title={translate('homePage.timeSensitiveSection.validateAccount.title')}
            subtitle={translate('homePage.timeSensitiveSection.validateAccount.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.validateAccount.cta')}
            onCtaPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path))}
            buttonProps={{success: true}}
        />
    );
}

export default ValidateAccount;
