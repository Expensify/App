import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

function FixEmailDelivery() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Mail']);

    return (
        <BaseWidgetItem
            icon={icons.Mail}
            title={translate('homePage.timeSensitiveSection.emailDeliveryFailure.title')}
            subtitle={translate('homePage.timeSensitiveSection.emailDeliveryFailure.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_EMAIL_ISSUE)}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
        />
    );
}

export default FixEmailDelivery;
