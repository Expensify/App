import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import ROUTES from '@src/ROUTES';

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
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute())}
            buttonProps={{success: true}}
        />
    );
}

export default ValidateAccount;
